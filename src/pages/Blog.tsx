import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag, ArrowRight, PenLine } from "lucide-react";
import { BlogDB } from "../db";
import type { BlogPost } from "../types";
import "./Blog.css";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  useEffect(() => {
    BlogDB.getAll(true).then(setPosts).catch(console.error);
  }, []);

  if (selected) {
    return (
      <main className="blog page">
        <div className="container blog__post">
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 32 }} onClick={() => setSelected(null)}>
            ← Back to Blog
          </button>
          <div className="section-label">{selected.tags[0]}</div>
          <h1 className="display-lg" style={{ margin: "16px 0 12px" }}>{selected.title}</h1>
          <div className="blog__post-meta">
            <Calendar size={14} />
            {new Date(selected.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div className="blog__post-tags">
            {selected.tags.map(t => <span key={t} className="tag"><Tag size={10} />{t}</span>)}
          </div>
          <div className="divider" />
          <div className="blog__post-content">
            {selected.content.split("\n").map((para, i) => para.trim() && (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="blog page">
      <div className="blog__orb" />
      <div className="container">
        <div className="blog__hero">
          <div className="section-label">Insights</div>
          <h1 className="display-xl animate-fade-up">
            The Valcrion <span className="gradient-text">Blog</span>
          </h1>
          <p className="blog__sub animate-fade-up delay-100">
            Thoughts on design, development, and building the web.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="blog__empty glass">
            <PenLine size={40} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
            <h3>No posts yet</h3>
            <p>Check back soon — the admin is working on something interesting.</p>
          </div>
        ) : (
          <div className="blog__grid">
            {posts.map((post, i) => (
              <div
                key={post.id}
                className={`skeu-card blog__card ${i === 0 ? "blog__card--featured" : ""}`}
                onClick={() => setSelected(post)}
              >
                <div className="blog__card-tags">
                  {post.tags.slice(0, 2).map(t => (
                    <span key={t} className="tag"><Tag size={10} />{t}</span>
                  ))}
                </div>
                <h3 className="blog__card-title">{post.title}</h3>
                <p className="blog__card-excerpt">
                  {post.excerpt || post.content.slice(0, 120)}...
                </p>
                <div className="blog__card-footer">
                  <span className="blog__card-date">
                    <Calendar size={12} />
                    {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="blog__card-read" style={{ color: "var(--accent)", fontSize: "0.82rem", fontWeight: 500 }}>
                    Read more <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
