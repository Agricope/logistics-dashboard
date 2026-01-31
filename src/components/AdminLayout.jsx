import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminTopBar from "./AdminTopBar.jsx";
import SOSNotification from "./SOSNotification.jsx";
import "./AdminLayout.css";

const { Sider, Content, Header } = Layout;

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sosNotification, setSOSNotification] = useState(null);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Get user ID - handle both _id and id
    const userId = user?._id || user?.id;
    if (!userId) {
      console.log('No user ID found, skipping socket connection');
      return;
    }

    // Connect to admin socket namespace (Customer-Tech API)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    console.log('Attempting to connect to socket at:', socketUrl);
    
    const adminSocket = io(`${socketUrl}/admin`, {
      transports: ['websocket', 'polling'],  // Allow fallback to polling
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    adminSocket.on('connect', () => {
      console.log('✅ Admin socket connected to:', socketUrl);
      console.log('Registering admin with ID:', userId);
      adminSocket.emit('register', userId);
    });

    adminSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    adminSocket.on('newSOSRequest', (data) => {
      console.log('New SOS request received:', data);
      setSOSNotification(data);
      
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(err => console.log('Could not play sound:', err));
    });

    adminSocket.on('disconnect', () => {
      console.log('Admin socket disconnected');
    });

    setSocket(adminSocket);

    return () => {
      adminSocket.disconnect();
    };
  }, [user]);

  const handleToggleSidebar = () => {
    setSidebarOpen((open) => !open);
  };

  const handleCreateJob = (sosData) => {
    // Emit sosAccepted event to notify customer that admin is handling their SOS
    if (socket) {
      socket.emit('sosAccepted', {
        sos_id: sosData.sos_id,
        customer_id: sosData.customer_id
      });
      console.log('Emitted sosAccepted for SOS:', sosData.sos_id);
    }
    
    // Navigate to Deliveries page and pass SOS data
    navigate('/deliveries', { state: { sosData } });
    setSOSNotification(null);
  };

  const handleDismissNotification = () => {
    setSOSNotification(null);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar isOpen={sidebarOpen} />
      <Layout className="admin-layout-content" style={{ minHeight: "100vh" }}>
        <AdminTopBar onToggleSidebar={handleToggleSidebar} isSidebarOpen={sidebarOpen} />
        <Content style={{ margin: "0", background: "var(--color-bg-page)", minHeight: "100vh" }}>
          {children}
        </Content>
      </Layout>
      
      {sosNotification && (
        <SOSNotification
          sosData={sosNotification}
          onCreateDelivery={handleCreateJob}
          onDismiss={handleDismissNotification}
        />
      )}
    </Layout>
  );
}

export default AdminLayout;
