import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Heading, ShoppingBag } from 'lucide-react';
import ProductInsertModal from './ProductInsertModal';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [showProductModal, setShowProductModal] = React.useState(false);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);
    
    if (url === null) {
      return; // Cancelled
    }

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  const handleProductInsert = (html: string) => {
    editor.chain().focus().insertContent(html).run();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 p-2 border-b dark:border-gray-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <Heading className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('italic') ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('orderedList') ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('link') ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowProductModal(true)}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Insert Product"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>

      {showProductModal && (
        <ProductInsertModal
          onSelect={handleProductInsert}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onImageUpload,
  disabled = false
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline'
        }
      })
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px]'
      }
    }
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (content !== editor.getHTML()) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  return (
    <div className="border rounded-lg dark:border-gray-700 overflow-hidden">
      <MenuBar editor={editor} />
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;