"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import LinkExt from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline, List, ListOrdered, Link,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo,
  Heading1, Heading2, Heading3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-red-400 underline" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing..." }),
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap-rte focus:outline-none min-h-[420px] px-5 py-4 text-sm leading-relaxed",
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const previous = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL:", previous);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const groups = [
    [
      { icon: <Undo size={14} />, action: () => editor.chain().focus().undo().run(), title: "Undo", active: false },
      { icon: <Redo size={14} />, action: () => editor.chain().focus().redo().run(), title: "Redo", active: false },
    ],
    [
      { icon: <Heading1 size={14} />, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), title: "Heading 1", active: editor.isActive("heading", { level: 1 }) },
      { icon: <Heading2 size={14} />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), title: "Heading 2", active: editor.isActive("heading", { level: 2 }) },
      { icon: <Heading3 size={14} />, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), title: "Heading 3", active: editor.isActive("heading", { level: 3 }) },
    ],
    [
      { icon: <Bold size={14} />, action: () => editor.chain().focus().toggleBold().run(), title: "Bold", active: editor.isActive("bold") },
      { icon: <Italic size={14} />, action: () => editor.chain().focus().toggleItalic().run(), title: "Italic", active: editor.isActive("italic") },
      { icon: <Underline size={14} />, action: () => editor.chain().focus().toggleUnderline().run(), title: "Underline", active: editor.isActive("underline") },
    ],
    [
      { icon: <List size={14} />, action: () => editor.chain().focus().toggleBulletList().run(), title: "Bullet list", active: editor.isActive("bulletList") },
      { icon: <ListOrdered size={14} />, action: () => editor.chain().focus().toggleOrderedList().run(), title: "Numbered list", active: editor.isActive("orderedList") },
    ],
    [
      { icon: <AlignLeft size={14} />, action: () => editor.chain().focus().setTextAlign("left").run(), title: "Align left", active: editor.isActive({ textAlign: "left" }) },
      { icon: <AlignCenter size={14} />, action: () => editor.chain().focus().setTextAlign("center").run(), title: "Align center", active: editor.isActive({ textAlign: "center" }) },
      { icon: <AlignRight size={14} />, action: () => editor.chain().focus().setTextAlign("right").run(), title: "Align right", active: editor.isActive({ textAlign: "right" }) },
    ],
    [
      { icon: <Link size={14} />, action: addLink, title: "Link", active: editor.isActive("link") },
    ],
  ];

  return (
    <>
      <style>{`
        .tiptap-rte h1 { font-size: 1.5rem; font-weight: 700; color: #f4f4f5; margin: 1rem 0 0.4rem; }
        .tiptap-rte h2 { font-size: 1.25rem; font-weight: 600; color: #e4e4e7; margin: 0.875rem 0 0.4rem; }
        .tiptap-rte h3 { font-size: 1.05rem; font-weight: 600; color: #d4d4d8; margin: 0.75rem 0 0.35rem; }
        .tiptap-rte p { color: #a1a1aa; margin: 0.25rem 0; }
        .tiptap-rte ul { list-style: disc; padding-left: 1.4rem; color: #a1a1aa; margin: 0.4rem 0; }
        .tiptap-rte ol { list-style: decimal; padding-left: 1.4rem; color: #a1a1aa; margin: 0.4rem 0; }
        .tiptap-rte li { margin: 0.15rem 0; }
        .tiptap-rte a { color: #f87171; text-decoration: underline; }
        .tiptap-rte strong { color: #f4f4f5; font-weight: 600; }
        .tiptap-rte em { color: #d4d4d8; font-style: italic; }
        .tiptap-rte u { text-decoration: underline; }
        .tiptap-rte p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #52525b;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-border-subtle bg-[#0d0d0d]">
        {groups.map((group, gi) => (
          <div
            key={gi}
            className={cn(
              "flex items-center gap-0.5",
              gi < groups.length - 1 && "pr-2 mr-1 border-r border-border-subtle"
            )}
          >
            {group.map((btn, bi) => (
              <button
                key={bi}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); btn.action(); }}
                title={btn.title}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-md transition-all",
                  btn.active
                    ? "bg-accent-red/20 text-accent-red"
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                )}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Content area */}
      <EditorContent editor={editor} />
    </>
  );
}
