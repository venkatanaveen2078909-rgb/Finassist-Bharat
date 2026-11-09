import MessageBubble from "./MessageBubble";

function ChatMessages({ messages = [] }) {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          sender={msg.sender}
          text={msg.text}
          agent={msg.agent}
        />
      ))}
    </div>
  );
}

export default ChatMessages;