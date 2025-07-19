'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalLine {
  type: 'command' | 'output' | 'success' | 'info' | 'tree';
  content: string;
  delay?: number;
  user?: string;
  path?: string;
  typing?: boolean;
}

const terminalSequence: TerminalLine[] = [
  {
    type: 'command',
    content: 'git clone https://github.com/filopedraz/kosuke-template.git',
    user: 'dev',
    path: '~/projects',
    delay: 0,
    typing: true,
  },
  {
    type: 'output',
    content: "Cloning into 'kosuke-template'...",
    delay: 800,
  },
  {
    type: 'output',
    content: 'remote: Enumerating objects: 247, done.',
    delay: 1200,
  },
  {
    type: 'output',
    content: 'Receiving objects: 100% (247/247), 1.2 MiB | 2.1 MiB/s, done.',
    delay: 1600,
  },
  {
    type: 'command',
    content: 'cd kosuke-template && tree -L 2',
    user: 'dev',
    path: '~/projects',
    delay: 2200,
    typing: true,
  },
  {
    type: 'tree',
    content: `kosuke-template/
├── 📁 app/                  # Next.js App Router
├── 📁 components/           # UI Components
├── 📁 lib/                  # Auth, DB, Utils
├── 📁 hooks/                # Custom React Hooks
├── 📱 cli/                  # Setup Wizard
├── 📄 package.json          # Dependencies
├── ⚙️  drizzle.config.ts    # Database Config
└── 🚀 README.md            # Getting Started`,
    delay: 2800,
  },
  {
    type: 'command',
    content: 'cd cli && python main.py',
    user: 'dev',
    path: '~/projects/kosuke-template',
    delay: 4200,
    typing: true,
  },
  {
    type: 'info',
    content: '🤖 Welcome to Kosuke Setup Wizard!',
    delay: 4800,
  },
  {
    type: 'info',
    content: '⚡ Configuring your environment...',
    delay: 5200,
  },
  {
    type: 'success',
    content: '✅ Ready to ship in 30 seconds!',
    delay: 5800,
  },
];

function TypingText({
  text,
  speed = 50,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span>
      {displayText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="text-primary"
        >
          ▋
        </motion.span>
      )}
    </span>
  );
}

export function TerminalComponent() {
  const [currentLine, setCurrentLine] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const commands = terminalSequence
      .filter((line) => line.type === 'command')
      .map((line) => line.content)
      .join('\n');

    navigator.clipboard.writeText(commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentLine < terminalSequence.length) {
        setCurrentLine((prev) => prev + 1);
      }
    }, terminalSequence[currentLine]?.delay || 1000);

    return () => clearTimeout(timer);
  }, [currentLine, isTypingComplete]);

  const renderPrompt = (user: string, path: string) => (
    <span className="select-none">
      <span className="text-emerald-400">{user}</span>
      <span className="text-muted-foreground">@</span>
      <span className="text-blue-400">macbook</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-yellow-400">{path}</span>
      <span className="text-muted-foreground">$</span>
    </span>
  );

  const renderTreeLine = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="pl-4 space-y-1 font-mono text-sm">
        {lines.map((line, index) => (
          <div key={index} className="flex items-center">
            <span className="text-muted-foreground mr-2 select-none">
              {line.includes('├──') || line.includes('└──') ? line.split(' ')[0] : ''}
            </span>
            <span
              className={
                line.includes('#')
                  ? 'text-muted-foreground'
                  : line.includes('📁')
                    ? 'text-blue-400'
                    : line.includes('📱')
                      ? 'text-purple-400'
                      : line.includes('📄')
                        ? 'text-yellow-400'
                        : line.includes('⚙️')
                          ? 'text-orange-400'
                          : line.includes('🚀')
                            ? 'text-emerald-400'
                            : 'text-foreground'
              }
            >
              {line.replace(/^[├└]──\s*/, '')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-gray-900/95 border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Terminal className="w-4 h-4" />
              <span className="text-sm font-mono">terminal — zsh — 80×24</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 h-8 px-3 text-xs font-mono"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy Commands
              </>
            )}
          </Button>
        </div>

        {/* Terminal Content */}
        <div className="p-6 bg-gray-900/95 font-mono text-sm min-h-[400px]">
          <div className="space-y-2">
            <AnimatePresence>
              {terminalSequence.slice(0, currentLine + 1).map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="leading-relaxed"
                >
                  {line.type === 'command' && (
                    <div className="flex items-start">
                      {renderPrompt(line.user!, line.path!)}
                      <span className="ml-2 text-white">
                        {line.typing && index === currentLine ? (
                          <TypingText
                            text={line.content}
                            speed={80}
                            onComplete={() => setIsTypingComplete(true)}
                          />
                        ) : (
                          line.content
                        )}
                      </span>
                    </div>
                  )}

                  {line.type === 'output' && (
                    <div className="text-gray-300 pl-2">{line.content}</div>
                  )}

                  {line.type === 'tree' && (
                    <div className="text-gray-300">{renderTreeLine(line.content)}</div>
                  )}

                  {line.type === 'info' && <div className="text-blue-400 pl-2">{line.content}</div>}

                  {line.type === 'success' && (
                    <div className="text-emerald-400 pl-2 font-semibold">{line.content}</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Blinking cursor at the end */}
            {currentLine >= terminalSequence.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center"
              >
                {renderPrompt('dev', '~/projects/kosuke-template')}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                  className="ml-2 text-primary"
                >
                  ▋
                </motion.span>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
