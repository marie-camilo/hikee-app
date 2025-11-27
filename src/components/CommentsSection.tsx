import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { db } from '../lib/firebase';
import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import Button from './Button';
import { FiTrash } from 'react-icons/fi';

export interface Comment {
  id: string;
  text: string;
  authorUid: string;
  authorName: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  replies?: Comment[];
}

interface CommentsSectionProps {
  comments: Comment[];
  canComment: boolean;
  hikeId: string;
  userUid: string;
  userName: string;
}

export default function CommentsSection({
                                          comments: initialComments = [],
                                          hikeId,
                                          userUid,
                                          userName,
                                          canComment,
                                        }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingTexts, setEditingTexts] = useState<{ [key: string]: string }>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyTexts, setEditingReplyTexts] = useState<{ [key: string]: string }>({});
  const [newComment, setNewComment] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});

  const editRef = useRef<HTMLTextAreaElement>(null);

  const now = Timestamp.fromDate(new Date());

  useEffect(() => {
    if ((editingCommentId || editingReplyId) && editRef.current) {
      editRef.current.focus();
      editRef.current.selectionStart = editRef.current.value.length;
    }
  }, [editingCommentId, editingReplyId]);

  // Charger les commentaires et leurs réponses
  useEffect(() => {
    const commentsRef = collection(db, 'hikes', hikeId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const comms = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const repliesSnap = await getDocs(
            collection(db, 'hikes', hikeId, 'comments', docSnap.id, 'replies')
          );
          const replies: Comment[] = repliesSnap.docs.map((r) => {
            const rData = r.data();
            return {
              id: r.id,
              ...rData,
              createdAt: rData.createdAt || null,
              updatedAt: rData.updatedAt || null,
            } as Comment;
          });
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            replies: replies.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)),
          } as Comment;
        })
      );
      setComments(comms);
    });

    return () => unsubscribe();
  }, [hikeId]);

  // Ajouter un commentaire
  const handleAddComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;

    try {
      await addDoc(collection(db, 'hikes', hikeId, 'comments'), {
        text,
        authorUid: userUid,
        authorName: userName,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  // Ajouter une réponse
  const handleAddReply = async (commentId: string) => {
    const text = replyTexts[commentId]?.trim();
    if (!text) return;

    const replyData = {
      text,
      authorUid: userUid,
      authorName: userName,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(
        collection(db, 'hikes', hikeId, 'comments', commentId, 'replies'),
        replyData
      );

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
              ...c,
              replies: [
                ...(c.replies || []),
                { id: docRef.id, text, authorUid: userUid, authorName: userName, createdAt: now },
              ],
            }
            : c
        )
      );

      setReplyTexts((prev) => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Edition et suppression commentaire
  const startEditingComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditingTexts((prev) => ({ ...prev, [c.id]: c.text }));
  };
  const cancelEditingComment = () => {
    if (editingCommentId) {
      setEditingTexts((prev) => {
        const copy = { ...prev };
        delete copy[editingCommentId];
        return copy;
      });
    }
    setEditingCommentId(null);
  };
  const saveEditComment = async (commentId: string) => {
    const trimmed = editingTexts[commentId]?.trim();
    if (!trimmed) return;
    try {
      await updateDoc(doc(db, 'hikes', hikeId, 'comments', commentId), {
        text: trimmed,
        updatedAt: serverTimestamp(),
      });
      cancelEditingComment();
    } catch (err) {
      console.error(err);
    }
  };
  const deleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'hikes', hikeId, 'comments', id));
    } catch (err) {
      console.error(err);
    }
  };

  // Edition et suppression replies
  const startEditingReply = (reply: Comment) => {
    setEditingReplyId(reply.id);
    setEditingReplyTexts((prev) => ({ ...prev, [reply.id]: reply.text }));
  };
  const cancelEditingReply = () => {
    if (editingReplyId) {
      setEditingReplyTexts((prev) => {
        const copy = { ...prev };
        delete copy[editingReplyId];
        return copy;
      });
    }
    setEditingReplyId(null);
  };
  const saveEditReply = async (commentId: string, replyId: string) => {
    const trimmed = editingReplyTexts[replyId]?.trim();
    if (!trimmed) return;

    try {
      await updateDoc(
        doc(db, 'hikes', hikeId, 'comments', commentId, 'replies', replyId),
        { text: trimmed, updatedAt: serverTimestamp() }
      );

      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? {
              ...c,
              replies: c.replies?.map(r =>
                r.id === replyId
                  ? { ...r, text: trimmed, updatedAt: Timestamp.fromDate(new Date()) }
                  : r
              )
            }
            : c
        )
      );

      cancelEditingReply();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReply = async (commentId: string, replyId: string) => {
    try {
      await deleteDoc(doc(db, 'hikes', hikeId, 'comments', commentId, 'replies', replyId));

      // Mise à jour locale immédiate
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, replies: c.replies?.filter(r => r.id !== replyId) }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (ts?: Timestamp | null) => {
    if (!ts) return 'maintenant';
    if ('toDate' in ts) return ts.toDate().toLocaleDateString('fr-FR', { dateStyle: 'medium' });
    return 'maintenant';
  };

  return (
    <div className="mt-8 bg-white shadow rounded-xl p-4 sm:p-6 space-y-4">
      <h3 className="text-xl font-semibold">Comments</h3>

      {comments.length > 0 ? (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <div className="flex-1">
                  {editingCommentId === c.id ? (
                    <textarea
                      ref={editRef}
                      className="w-full border border-gray-300 rounded-lg p-2 resize-none"
                      value={editingTexts[c.id]}
                      onChange={(e) => setEditingTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-800">{c.text}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    par {c.authorName} • {formatDate(c.createdAt)}
                    {c.updatedAt && ' (édité)'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                  {userUid === c.authorUid && (
                    editingCommentId === c.id ? (
                      <>
                        <Button
                          type="button"
                          onClick={() => saveEditComment(c.id)}
                          variant="sage"
                          size="md"
                        >
                          Sauvegarder
                        </Button>
                        <Button
                          type="button"
                          onClick={cancelEditingComment}
                          variant="moss"
                          size="md"
                        >
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => startEditingComment(c)}
                          variant="sky"
                          size="md"
                        >
                          Modifier
                        </Button>
                        {canComment && (
                          <Button
                            onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                            variant="moss"
                            size="md"
                          >
                            {replyingTo === c.id ? 'Annuler' : 'Répondre'}
                          </Button>
                        )}
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="text-slate-700 hover:text-red-700 p-2 rounded-full transition-colors cursor-pointer"
                          title="Supprimer ce commentaire"
                        >
                          <FiTrash size={20} />
                        </button>
                      </>
                    )
                  )}
                </div>
              </div>

              {/* Input réponse */}
              {replyingTo === c.id && (
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    value={replyTexts[c.id] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="Écrire une réponse…"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <Button
                    onClick={() => handleAddReply(c.id)}
                    variant="forest"
                    size="md"
                    arrow
                  >
                    Envoyer
                  </Button>
                </div>
              )}

              {/* Réponses */}
              {c.replies && c.replies.length > 0 && (
                <ul className="ml-4 mt-2 space-y-2">
                  {c.replies.map((r) => (
                    <li key={r.id} className="border-l border-gray-300 pl-4 flex flex-col sm:flex-row justify-between gap-2">
                      <div className="flex-1">
                        {editingReplyId === r.id ? (
                          <textarea
                            ref={editRef}
                            className="w-full border border-gray-300 rounded-lg p-2 resize-none"
                            value={editingReplyTexts[r.id]}
                            onChange={(e) => setEditingReplyTexts(prev => ({ ...prev, [r.id]: e.target.value }))}
                            rows={2}
                          />
                        ) : (
                          <p className="text-gray-800">{r.text}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          par {r.authorName} • {formatDate(r.createdAt)}
                          {r.updatedAt && ' (édité)'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-1 sm:mt-0 items-center">
                        {userUid === r.authorUid && (
                          editingReplyId === r.id ? (
                            <>
                              <Button
                                type="button"
                                onClick={() => saveEditComment(c.id)}
                                variant="sage"
                                size="md"
                              >
                                Sauvegarder
                              </Button>
                              <Button
                                type="button"
                                onClick={cancelEditingComment}
                                variant="moss"
                                size="md"
                              >
                                Annuler
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => startEditingComment(c)}
                                variant="sky"
                                size="sm"
                              >
                                Modifier
                              </Button>
                              <button
                                onClick={() => deleteReply(c.id, r.id)}
                                className="text-slate-700 hover:text-red-700 p-2 rounded-full transition-colors cursor-pointer"
                                title="Supprimer cette réponse"
                              >
                                <FiTrash size={16} />
                              </button>
                            </>
                          )
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
      )}

      {/* Ajouter commentaire */}
      {canComment && (
        <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire…"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            minLength={1}
            maxLength={500}
          />
          <Button
            onClick={() => handleAddReply(c.id)}
            variant="forest"
            size="md"
            arrow
          >
            Envoyer
          </Button>
        </form>
      )}
    </div>
  );
}
