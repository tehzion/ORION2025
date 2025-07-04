import React, { useState, useEffect } from 'react'
import { MessageSquare, Send, Users, User, Shield, Crown, Eye, Search, MoreVertical } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { DEMO_MODE, DEMO_USERS } from '../../lib/demo'

interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  timestamp: string
  is_read: boolean
}

interface ChatUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'developer' | 'client' | 'viewer'
  avatar: string
  is_online: boolean
  last_seen: string
}

interface ChatConversation {
  id: string
  participants: ChatUser[]
  last_message?: ChatMessage
  unread_count: number
}

// Demo chat data
const DEMO_CHAT_USERS: ChatUser[] = [
  {
    id: 'super-admin-1',
    name: 'Mojo Digital Admin',
    email: 'admin@mojodigital.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    is_online: true,
    last_seen: new Date().toISOString()
  },
  {
    id: 'admin-1',
    name: 'Sarah Johnson',
    email: 'sarah@orion.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    is_online: true,
    last_seen: new Date().toISOString()
  },
  {
    id: 'developer-1',
    name: 'Michael Chen',
    email: 'michael@orion.com',
    role: 'developer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    is_online: false,
    last_seen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'client-1',
    name: 'Lisa Thompson',
    email: 'lisa@client.com',
    role: 'client',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    is_online: true,
    last_seen: new Date().toISOString()
  },
  {
    id: 'viewer-1',
    name: 'David Kim',
    email: 'david@orion.com',
    role: 'viewer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    is_online: false,
    last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
]

const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender_id: 'client-1',
    receiver_id: 'super-admin-1',
    content: 'Hi! I have a question about my project timeline.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    is_read: true
  },
  {
    id: '2',
    sender_id: 'super-admin-1',
    receiver_id: 'client-1',
    content: 'Hello Lisa! I\'d be happy to help. What specific concerns do you have?',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    is_read: true
  },
  {
    id: '3',
    sender_id: 'client-1',
    receiver_id: 'super-admin-1',
    content: 'I was wondering if we could extend the deadline by a week?',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    is_read: false
  },
  {
    id: '4',
    sender_id: 'admin-1',
    receiver_id: 'developer-1',
    content: 'Michael, can you review the latest changes?',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    is_read: false
  },
  {
    id: '5',
    sender_id: 'super-admin-1',
    receiver_id: 'admin-1',
    content: 'Sarah, please check the system settings.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    is_read: true
  }
]

const ChatSystem: React.FC = () => {
  const { user, globalRole } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([])

  useEffect(() => {
    if (user) {
      initializeChat()
    }
  }, [user, globalRole])

  const initializeChat = () => {
    // Get available users based on role
    const available = getAvailableUsers()
    setAvailableUsers(available)
    
    // Create conversations based on role
    const userConversations = createConversations(available)
    setConversations(userConversations)
    
    // Select first conversation if available
    if (userConversations.length > 0) {
      setSelectedConversation(userConversations[0])
      loadMessages(userConversations[0].id)
    }
  }

  const getAvailableUsers = (): ChatUser[] => {
    switch (globalRole) {
      case 'super_admin':
        // Super admin can chat with everyone
        return DEMO_CHAT_USERS.filter(u => u.id !== 'super-admin-1')
      
      case 'client':
        // Client can only chat with super admin
        return DEMO_CHAT_USERS.filter(u => u.role === 'super_admin')
      
      case 'admin':
        // Admin can chat with super admin and team members
        return DEMO_CHAT_USERS.filter(u => 
          u.role === 'super_admin' || u.role === 'developer' || u.role === 'viewer'
        )
      
      case 'developer':
        // Developer can chat with admin and other developers
        return DEMO_CHAT_USERS.filter(u => 
          u.role === 'admin' || u.role === 'developer'
        )
      
      case 'viewer':
        // Viewer can chat with admin and developers
        return DEMO_CHAT_USERS.filter(u => 
          u.role === 'admin' || u.role === 'developer'
        )
      
      default:
        return []
    }
  }

  const createConversations = (users: ChatUser[]): ChatConversation[] => {
    return users.map(user => {
      const conversationId = `conv-${user.id}`
      const lastMessage = DEMO_MESSAGES.find(m => 
        (m.sender_id === user.id && m.receiver_id === 'current-user') ||
        (m.receiver_id === user.id && m.sender_id === 'current-user')
      )
      
      const unreadCount = DEMO_MESSAGES.filter(m => 
        m.receiver_id === 'current-user' && 
        m.sender_id === user.id && 
        !m.is_read
      ).length

      return {
        id: conversationId,
        participants: [user],
        last_message: lastMessage,
        unread_count: unreadCount
      }
    })
  }

  const loadMessages = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (!conversation) return

    const participant = conversation.participants[0]
    const conversationMessages = DEMO_MESSAGES.filter(m => 
      (m.sender_id === participant.id && m.receiver_id === 'current-user') ||
      (m.receiver_id === participant.id && m.sender_id === 'current-user')
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    setMessages(conversationMessages)
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const participant = selectedConversation.participants[0]
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender_id: 'current-user',
      receiver_id: participant.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      is_read: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, last_message: message, unread_count: 0 }
        : conv
    ))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-4 w-4 text-yellow-400" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-400" />
      case 'developer': return <User className="h-4 w-4 text-green-400" />
      case 'client': return <Eye className="h-4 w-4 text-purple-400" />
      case 'viewer': return <Eye className="h-4 w-4 text-slate-400" />
      default: return <User className="h-4 w-4 text-slate-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'developer': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'client': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'viewer': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations.filter(conv => 
    conv.participants[0].name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants[0].email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full flex bg-slate-900">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(globalRole)}`}>
                {globalRole === 'super_admin' ? 'Super Admin' : 
                 globalRole === 'admin' ? 'Admin' :
                 globalRole === 'developer' ? 'Developer' :
                 globalRole === 'client' ? 'Client' :
                 globalRole === 'viewer' ? 'Viewer' : globalRole}
              </span>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const participant = conversation.participants[0]
              const isSelected = selectedConversation?.id === conversation.id
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation)
                    loadMessages(conversation.id)
                  }}
                  className={`p-4 border-b border-slate-800 cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {participant.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium text-sm truncate">
                          {participant.name}
                        </h3>
                        {conversation.unread_count > 0 && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleIcon(participant.role)}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(participant.role)}`}>
                          {participant.role === 'super_admin' ? 'Super Admin' : 
                           participant.role === 'admin' ? 'Admin' :
                           participant.role === 'developer' ? 'Developer' :
                           participant.role === 'client' ? 'Client' :
                           participant.role === 'viewer' ? 'Viewer' : participant.role}
                        </span>
                      </div>
                      {conversation.last_message && (
                        <p className="text-slate-400 text-xs mt-1 truncate">
                          {conversation.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selectedConversation.participants[0].avatar}
                      alt={selectedConversation.participants[0].name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedConversation.participants[0].is_online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {selectedConversation.participants[0].name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(selectedConversation.participants[0].role)}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedConversation.participants[0].role)}`}>
                        {selectedConversation.participants[0].role === 'super_admin' ? 'Super Admin' : 
                         selectedConversation.participants[0].role === 'admin' ? 'Admin' :
                         selectedConversation.participants[0].role === 'developer' ? 'Developer' :
                         selectedConversation.participants[0].role === 'client' ? 'Client' :
                         selectedConversation.participants[0].role === 'viewer' ? 'Viewer' : selectedConversation.participants[0].role}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-white">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No messages yet</h3>
                  <p className="text-slate-400 text-sm">
                    Start a conversation with {selectedConversation.participants[0].name}
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === 'current-user'
                  const sender = isOwnMessage 
                    ? { name: 'You', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }
                    : selectedConversation.participants[0]

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!isOwnMessage && (
                          <img
                            src={sender.avatar}
                            alt={sender.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className={`rounded-lg px-4 py-2 ${
                          isOwnMessage 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-slate-800 text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-purple-200' : 'text-slate-400'
                          }`}>
                            {formatTime(message.timestamp as string)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Select a conversation</h3>
              <p className="text-slate-400 text-sm">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatSystem 