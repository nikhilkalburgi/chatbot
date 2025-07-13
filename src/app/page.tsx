'use client';
import { useChat } from '@ai-sdk/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Download, Send, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CodeBlock {
  language: string;
  code: string;
  originalBlock: string;
}

function hasVisibleHtmlContent(code: string) {
  return /<(div|span|p|img|button|h[1-6]|svg|canvas|table|ul|ol|li>|section|article|header|footer|main|nav)>*/img.test(code);
}

function PreviewBlock({ lang, code }: { lang: string; code: string }) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [copied, setCopied] = useState(false);
  console.log(copied);

  let hasPreview = false;
  hasPreview = hasVisibleHtmlContent(code);

  console.log(hasPreview, 'Rendering PreviewBlock for lang:', lang, 'code:', code);

  if (lang === 'html' && hasPreview) {
    return (
      <div className="my-4 border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HTML Preview</span>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Copy code"
            >
              <Copy size={16} />
            </button>
            <a
              href={URL.createObjectURL(new Blob([code], { type: 'text/html' }))}
              download="preview.html"
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Download HTML"
            >
              <Download size={16} />
            </a>
          </div>
        </div>
        <iframe
          srcDoc={code}
          className="w-full h-64 border-0"
          title="HTML Preview"
        />
      </div>
    );
  }

  return null;
}

function extractCodeBlocks(text: string): { cleanedText: string; codeBlocks: CodeBlock[] } {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks: CodeBlock[] = [];
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    const originalBlock = match[0];

    if (['html'].includes(language.toLowerCase())) {
      codeBlocks.push({
        language: language.toLowerCase(),
        code,
        originalBlock
      });
    }
  }
  
  let cleanedText = text;
  
  cleanedText = cleanedText.replace(/\n\n\n+/g, '\n\n').trim();
  
  return { cleanedText, codeBlocks };
}

function MessageContent({ content }: { content: string }) {
  const { cleanedText, codeBlocks } = extractCodeBlocks(content);
  
  return (
    <div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            code: ({ children, ...props }) => {
              const codeContent = String(children).replace(/\n$/, '');
              const isInline = !codeContent.includes('\n') && codeContent.length < 100;

              const copyToClipboard = async (event: React.MouseEvent<HTMLButtonElement>) => {
                const button = event.currentTarget;
                const container = button.closest('.group');
                const codeToCopy = container?.querySelector('#code_to_copy');
                if (!codeToCopy) return;
                const codeContent = codeToCopy.textContent || '';
                await navigator.clipboard.writeText(codeContent);
              };

              if (isInline) {
                return (
                  <code 
                    className="bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              
              return (
                <div className="my-4 relative group">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-t-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {'Code'}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-opacity"
                      title={'Copy code'}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-white rounded-lg p-4 overflow-x-auto text-sm">
                    <code {...props} id='code_to_copy'>{children}</code>
                  </pre>
                </div>
              );
            },
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
          }}
        >
          {cleanedText}
        </ReactMarkdown>
      </div>
      
      {/* Render extracted code blocks as PreviewBlocks */}
      {codeBlocks.length > 0 && (
        <div className="mt-4 space-y-4">
          {codeBlocks.map((block, index) => (
            <PreviewBlock 
              key={index} 
              lang={block.language} 
              code={block.code} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Chat() {
  const { status } = useSession();
  const router = useRouter();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [history, setHistory] = useState<{ id: string; createdAt: string; prompt: string; response: string }[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/history')
        .then(res => res.json())
        .then(data => setHistory(data.chats.reverse() || []));
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Asymmetri Chat Bot</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {history.length > 0 && (
            <div className="space-y-4 pb-6">
              {history.map(chat => (
                <div key={chat.id} className="space-y-4">
                  <div className="flex gap-4 justify-end">
                    <div className="max-w-3xl bg-blue-600 text-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} />
                        <span className="font-medium">You</span>
                        <span className="text-sm text-gray-100">
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>{chat.prompt}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="max-w-3xl bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <MessageContent content={chat.response} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {messages.length === 0 && history.length === 0 ? (
            <div className="text-center py-16">
              <Bot size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Start a conversation by typing a message below
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                  </div>
                )}
                <div className={`max-w-3xl ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'} rounded-lg p-4 shadow-sm`}>
                  {message.role === 'user' && (
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} />
                      <span className="font-medium">You</span>
                    </div>
                  )}
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div key={i}>
                            <MessageContent content={part.text} />
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={input}
              placeholder="Type your message here..."
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}