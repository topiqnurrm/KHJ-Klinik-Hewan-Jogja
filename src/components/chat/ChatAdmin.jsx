import React from "react";
import "./ChatAdmin.css"; // Pastikan file CSS sudah dibuat
import chat from "./gambar/chat.png"; // Sesuaikan path ikon

const ChatButton = ({ onClick }) => {
  return (
    <button className="chat-button" onClick={onClick}>
      <img src={chat} alt="Chat" className="chat-icon" />
      <span>Kontak KHJ</span>
    </button>
  );
};

export default ChatButton;
