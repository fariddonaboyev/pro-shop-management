import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { createConversation, createAgentChat } from '../lib/agent-chat/v2';
import { Conversation, ConversationContent, ConversationScrollButton } from '../components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '../components/ai-elements/message';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '../components/ai-elements/tool';
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from '../components/ai-elements/confirmation';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from '../components/ai-elements/prompt-input';
import { Suggestions, Suggestion } from '../components/ai-elements/suggestion';
import { isToolUIPart } from 'ai';
import type { UIMessage } from 'ai';
import { MessageCircle, X, Sparkles, RefreshCw } from 'lucide-react';
import { ulid } from 'ulidx';

const AGENT_ID = '01KS3189TV3TZSYXFKY41VPV4G';

export const SmartAgentChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chat, setChat] = useState<ReturnType<typeof createAgentChat> | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);

  const handleStartChat = async () => {
    setIsLoadingChat(true);
    try {
      const { conversationId } = await createConversation(AGENT_ID);
      setChat(createAgentChat(AGENT_ID, conversationId));
    } catch (err) {
      console.error('Error starting conversation:', err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const isChatReady = chat !== null;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 z-50 flex items-center justify-center border border-white/10"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6 animate-pulse" />}
      </button>

      {/* Floating Chat Container */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[580px] bg-card border border-border/80 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center shadow">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm">PRO Shop Yordamchisi</h3>
                <span className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sinxron onlayn yordamchi
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Active Chat or Onboarding Panel */}
          <div className="flex-1 flex flex-col bg-background/30 overflow-hidden">
            {!isChatReady ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
                <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <Sparkles className="h-10 w-10 text-blue-400 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">PRO Shop Aqlli Yordamchisi</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                    Sizga kassa, stol boshqaruvi, LAN sinxronizatsiyasi va litsenziya masalalarida maslahat beradigan aqlli AI xizmati.
                  </p>
                </div>
                <button
                  onClick={handleStartChat}
                  disabled={isLoadingChat}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/15"
                >
                  {isLoadingChat ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Suhbatni boshlash</span>
                </button>
              </div>
            ) : (
              <ActiveChatPanel chat={chat!} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

interface ActiveChatPanelProps {
  chat: ReturnType<typeof createAgentChat>;
}

function ActiveChatPanel({ chat }: ActiveChatPanelProps) {
  const { messages, status, addToolApprovalResponse } = useChat({ chat, id: chat.id });

  const handleSend = async (text: string) => {
    await chat.sendMessage({
      id: ulid(),
      role: 'user',
      parts: [{ type: 'text', text }],
    });
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <Conversation>
          <ConversationContent>
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  <MessageParts message={msg} onApprove={addToolApprovalResponse} />
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Suggestion pills if there are no messages */}
      {!hasMessages && (
        <Suggestions>
          <Suggestion
            suggestion="Litsenziyani qanday faollashtiraman?"
            onClick={handleSend}
          />
          <Suggestion
            suggestion="Oflayn sinxronizatsiya qanday ishlaydi?"
            onClick={handleSend}
          />
        </Suggestions>
      )}

      {/* Input container */}
      <div className="p-3 border-t border-border/40 bg-background/50 flex-shrink-0">
        <PromptInput onSubmit={({ text }) => handleSend(text)}>
          <PromptInputTextarea placeholder="Xabaringizni yozing..." />
          <PromptInputFooter>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

interface MessagePartsProps {
  message: UIMessage;
  onApprove: ReturnType<typeof useChat>['addToolApprovalResponse'];
}

function MessageParts({ message, onApprove }: MessagePartsProps) {
  return (
    <>
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;

        if (part.type === 'text') {
          return message.role === 'user' ? (
            <p key={key} className="text-sm">{part.text}</p>
          ) : (
            <MessageResponse key={key}>{part.text}</MessageResponse>
          );
        }

        if (isToolUIPart(part)) {
          return (
            <Tool key={key}>
              <ToolHeader type={part.type} state={part.state} />
              <ToolContent>
                <ToolInput input={part.input} />
                <Confirmation approval={part.approval} state={part.state}>
                  <ConfirmationRequest>
                    <ConfirmationTitle>Ushbu amalni bajarishga ruxsat berasizmi?</ConfirmationTitle>
                  </ConfirmationRequest>
                  <ConfirmationAccepted>Tasdiqlandi</ConfirmationAccepted>
                  <ConfirmationRejected>Inkor etildi</ConfirmationRejected>
                  <ConfirmationActions>
                    <ConfirmationAction
                      variant="outline"
                      onClick={() =>
                        part.approval != null && onApprove({ id: part.approval.id, approved: false })
                      }
                    >
                      Inkor etish
                    </ConfirmationAction>
                    <ConfirmationAction
                      onClick={() =>
                        part.approval != null && onApprove({ id: part.approval.id, approved: true })
                      }
                    >
                      Tasdiqlash
                    </ConfirmationAction>
                  </ConfirmationActions>
                </Confirmation>
                <ToolOutput output={part.output} errorText={part.errorText} />
              </ToolContent>
            </Tool>
          );
        }

        return null;
      })}
    </>
  );
}
