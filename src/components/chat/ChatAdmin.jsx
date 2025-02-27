import React from "react";
import "./ChatAdmin.css"; // Pastikan file CSS sudah dibuat
import chat from "./gambar/chat.png"; // Sesuaikan path ikon

const ChatButton = () => {
  const handleChatClick = () => {
    const whatsappNumber = "+6288232363332";
    const whatsappURL = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
    window.open(whatsappURL, "_blank"); // Membuka WhatsApp di tab baru
  };

  return (
    <button className="chat-button" onClick={handleChatClick}>
      <img src={chat} alt="Chat" className="chat-icon" />
      <span>Kontak KHJ</span>
    </button>
  );
};

export default ChatButton;
