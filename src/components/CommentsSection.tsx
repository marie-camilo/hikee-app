import React, { useState, useRef, useEffect, FormEvent } from "react";
import { db } from "../lib/firebase";
import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
  Unsubscribe,
} from "firebase/firestore";

import Button from "./Button";
import { FiTrash, FiHeart, FiCornerDownRight } from "react-icons/fi";
import defaultAvatar from "../assets/default_user.png";
import { useNavigate } from "react-router-dom";

export interface Comment {
  id: string;
  text: string;
  authorUid: string;
  authorName: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  replies?: Comment[];
  likes?: string[];
  photoURL?: string | null;
}

interface CommentsSectionProps {
  comments?: Comment[];
  canComment: boolean;
  hikeId: string;
  userUid: string;
  userName: string;
  userPhoto?: string | null;
}

export default function CommentsSection({
                                          comments: initialComments = [],
                                          hikeId,
                                          userUid,
                                          userName,
                                          userPhoto,
                                          canComment,
                                        }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingTexts, setEditingTexts] = useState<Record<string, string>>({});

  const editRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (editRef.current) {
      setTimeout(() => {
        try {
          editRef.current?.focus();
          if ("selectionStart" in editRef.current) {
            const el = editRef.current as HTMLTextAreaElement;
            el.selectionStart = el.value.length;
          }
        } catch (e) {}
      }, 50);
    }
  }, [editingCommentId, editingReplyId, replyingTo]);

  useEffect(() => {
    const commentsRef = collection(db, "hikes", hikeId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const replyUnsubs: Record<string, Unsubscribe> = {};

    const unsubComments = onSnapshot(q, (snapshot) => {
      setComments((prev) => {
        const currentIds = snapshot.docs.map((d) => d.id);

        // Supprime les listeners des commentaires qui n'existent plus
        Object.keys(replyUnsubs).forEach((cid) => {
          if (!currentIds.includes(cid)) {
            try {
              replyUnsubs[cid]?.();
            } catch {}
            delete replyUnsubs[cid];
          }
        });

        return snapshot.docs.map((d) => {
          const data = d.data() as any;
          const existing = prev.find((c) => c.id === d.id);

          // Si le listener des replies n'existe pas, on le crée
          if (!replyUnsubs[d.id]) {
            const repliesRef = collection(db, "hikes", hikeId, "comments", d.id, "replies");
            const qReplies = query(repliesRef, orderBy("createdAt", "asc"));
            const unsubReplies = onSnapshot(qReplies, (snapR) => {
              const replies: Comment[] = snapR.docs.map((r) => {
                const rd = r.data() as any;
                return {
                  id: r.id,
                  text: rd.text ?? "",
                  authorUid: rd.authorUid ?? "",
                  authorName: rd.authorName ?? "Anonyme",
                  createdAt: rd.createdAt ?? null,
                  updatedAt: rd.updatedAt ?? null,
                  likes: Array.isArray(rd.likes) ? rd.likes : [],
                  photoURL: rd.photoURL ?? null,
                } as Comment;
              });

              // On merge les replies sans écraser les autres champs
              setComments((prevC) =>
                prevC.map((c) => (c.id === d.id ? { ...c, replies } : c))
              );
            });
            replyUnsubs[d.id] = unsubReplies;
          }

          return {
            id: d.id,
            text: data.text ?? "",
            authorUid: data.authorUid ?? "",
            authorName: data.authorName ?? "Anonyme",
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
            likes: Array.isArray(data.likes) ? data.likes : [],
            photoURL: data.photoURL ?? null,
            replies: existing?.replies ?? [],
          } as Comment;
        });
      });
    });

    return () => {
      try {
        unsubComments();
      } catch {}
      Object.values(replyUnsubs).forEach((u) => {
        try {
          u();
        } catch {}
      });
    };
  }, [hikeId]);

  // Add a comment
  const handleAddComment = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const text = newComment.trim();
    if (!text) return;

    try {
      await addDoc(collection(db, "hikes", hikeId, "comments"), {
        text,
        authorUid: userUid,
        authorName: userName,
        photoURL: userPhoto ?? null,
        likes: [],
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (err) {
      console.error("add comment error", err);
    }
  };

  // Add a reply under a comment
  const handleAddReply = async (commentId: string) => {
    const text = (replyTexts[commentId] || "").trim();
    if (!text) return;

    try {
      await addDoc(
        collection(db, "hikes", hikeId, "comments", commentId, "replies"),
        {
          text,
          authorUid: userUid,
          authorName: userName,
          photoURL: userPhoto ?? null,
          createdAt: serverTimestamp(),
        }
      );
      setReplyTexts((p) => ({ ...p, [commentId]: "" }));
      setReplyingTo(null);
    } catch (err) {
      console.error("add reply error", err);
    }
  };

  const toggleLike = async (commentId: string, likes: string[] = []) => {
    if (!userUid) {
      navigate("/login");
      return;
    }

    try {
      const refDoc = doc(db, "hikes", hikeId, "comments", commentId);
      const already = likes.includes(userUid);
      await updateDoc(refDoc, {
        likes: already ? arrayRemove(userUid) : arrayUnion(userUid),
      });
    } catch (err) {
      console.error("toggleLike error", err);
    }
  };

  // Edit comment
  const startEditComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditingTexts({ ...editingTexts, [c.id]: c.text });
  };
  const saveEditComment = async (commentId: string) => {
    const t = (editingTexts[commentId] || "").trim();
    if (!t) return;
    try {
      await updateDoc(doc(db, "hikes", hikeId, "comments", commentId), {
        text: t,
        updatedAt: serverTimestamp(),
      });
      setEditingCommentId(null);
    } catch (err) {
      console.error("saveEditComment", err);
    }
  };

  // Edit reply
  const startEditReply = (reply: Comment) => {
    setEditingReplyId(reply.id);
    setEditingTexts({ ...editingTexts, [reply.id]: reply.text });
  };
  const saveEditReply = async (commentId: string, replyId: string) => {
    const t = (editingTexts[replyId] || "").trim();
    if (!t) return;
    try {
      await updateDoc(
        doc(db, "hikes", hikeId, "comments", commentId, "replies", replyId),
        { text: t, updatedAt: serverTimestamp() }
      );
      setEditingReplyId(null);
    } catch (err) {
      console.error("saveEditReply", err);
    }
  };

  // Delete
  const deleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "hikes", hikeId, "comments", id));
    } catch (err) {
      console.error("deleteComment", err);
    }
  };
  const deleteReply = async (commentId: string, replyId: string) => {
    try {
      await deleteDoc(
        doc(db, "hikes", hikeId, "comments", commentId, "replies", replyId)
      );
    } catch (err) {
      console.error("deleteReply", err);
    }
  };

  const formatDate = (ts?: Timestamp | null) =>
    ts?.toDate().toLocaleDateString("fr-FR", { dateStyle: "medium" }) ??
    "maintenant";

  return (
    <div className="mt-8 bg-white shadow rounded-xl p-4 sm:p-6 space-y-4">
      <h3 className="text-xl font-semibold">Comments</h3>

      {comments.length === 0 && (
        <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
      )}

      <ul className="space-y-4">
        {comments.map((c) => (
          <li
            key={c.id}
            className="bg-gray-50 border border-gray-200 p-4 rounded-lg"
          >
            <div className="flex gap-3 items-start">
              <img
                src={c.photoURL ?? defaultAvatar}
                alt={c.authorName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="grow">
                    {editingCommentId === c.id ? (
                      <textarea
                        ref={editRef as any}
                        className="w-full border rounded-lg p-2"
                        value={editingTexts[c.id] ?? ""}
                        onChange={(e) =>
                          setEditingTexts((p) => ({ ...p, [c.id]: e.target.value }))
                        }
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-800">{c.text}</p>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      <strong className="text-gray-700">{c.authorName}</strong> •{" "}
                      {formatDate(c.createdAt)}
                      {c.updatedAt && " (édité)"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => toggleLike(c.id, c.likes || [])}
                      title="Like"
                      className={`flex items-center gap-1 text-sm ${
                        (c.likes || []).includes(userUid)
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      <FiHeart size={18} />
                      <span className="text-xs">{(c.likes || []).length}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {/* Edit/Delete si auteur */}
                  {userUid === c.authorUid ? (
                    editingCommentId === c.id ? (
                      <>
                        <Button onClick={() => saveEditComment(c.id)} variant="sage">
                          Sauvegarder
                        </Button>
                        <Button onClick={() => setEditingCommentId(null)} variant="moss">
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => startEditComment(c)} variant="sky" size="sm">
                          Modifier
                        </Button>
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="text-red-600 p-2 rounded hover:bg-red-50"
                          title="Supprimer"
                        >
                          <FiTrash />
                        </button>
                      </>
                    )
                  ) : null}

                  {/* Bouton Répondre uniquement si connecté */}
                  {userUid && (
                    <Button
                      onClick={() => setReplyingTo((p) => (p === c.id ? null : c.id))}
                      variant={replyingTo === c.id ? "moss" : "forest"}
                      size="sm"
                      className="ml-auto"
                      icon={<FiCornerDownRight />}
                    >
                      {replyingTo === c.id ? "Annuler" : "Répondre"}
                    </Button>
                  )}
                </div>

                {replyingTo === c.id && userUid && (
                  <div className="mt-3 flex gap-2 items-start">
                    <input
                      value={replyTexts[c.id] ?? ""}
                      onChange={(e) => setReplyTexts((p) => ({ ...p, [c.id]: e.target.value }))}
                      placeholder="Votre réponse…"
                      className="flex-1 border rounded-lg px-3 py-2"
                    />
                    <Button onClick={() => handleAddReply(c.id)} variant="forest">
                      Envoyer
                    </Button>
                  </div>
                )}

                <ul className="ml-6 mt-4 space-y-3 border-l pl-4 border-gray-300">
                  {(c.replies || []).map((r) => (
                    <li key={r.id} className="space-y-1">
                      <div className="flex gap-3 items-start">
                        <img
                          src={r.photoURL ?? defaultAvatar}
                          alt={r.authorName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          {editingReplyId === r.id ? (
                            <textarea
                              ref={editRef as any}
                              className="w-full border rounded-lg p-2"
                              value={editingTexts[r.id] ?? ""}
                              onChange={(e) =>
                                setEditingTexts((p) => ({ ...p, [r.id]: e.target.value }))
                              }
                              rows={2}
                            />
                          ) : (
                            <p className="text-gray-800">{r.text}</p>
                          )}

                          <p className="text-xs text-gray-500 mt-1">
                            <strong className="text-gray-700">{r.authorName}</strong> •{" "}
                            {formatDate(r.createdAt)}
                            {r.updatedAt && " (édité)"}
                          </p>

                          <div className="mt-2 flex gap-2 items-center">
                            {userUid === r.authorUid ? (
                              editingReplyId === r.id ? (
                                <>
                                  <Button
                                    onClick={() => saveEditReply(c.id, r.id)}
                                    variant="sage"
                                    size="sm"
                                  >
                                    Sauvegarder
                                  </Button>
                                  <Button onClick={() => setEditingReplyId(null)} variant="moss" size="sm">
                                    Annuler
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button onClick={() => startEditReply(r)} variant="sky" size="sm">
                                    Modifier
                                  </Button>
                                  <button
                                    onClick={() => deleteReply(c.id, r.id)}
                                    className="text-red-600 p-2 rounded hover:bg-red-50"
                                    title="Supprimer"
                                  >
                                    <FiTrash />
                                  </button>
                                </>
                              )
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {canComment && (
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire…"
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <Button type="submit" variant="forest">
            Envoyer
          </Button>
        </form>
      )}
    </div>
  );
}
