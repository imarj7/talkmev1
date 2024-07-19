import { useEffect, useRef, useState } from 'react';
import pic from '../../assets/pic.jpg';
// import img from 'favicon.png';
import Input from '../../components/Input';
import { io } from 'socket.io-client';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')));
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showFriends, setShowFriends] = useState(false);
  const [loading, setLoading] = useState(false);
  const messageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Setting up socket...');
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    newSocket.emit('addUser', user?.id);

    newSocket.on('getUsers', users => {
      console.log('activeUsers :>> ', users);
    });

    newSocket.on('getMessage', data => {
      console.log('Received message: ', data);
      ;
      
    });

    return () => {
      console.log('Cleaning up socket...');
      newSocket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.messages]);

  const fetchConversations = async () => {
	const loggedInUser = JSON.parse(localStorage.getItem('user:detail'));
	const res = await fetch(`http://localhost:8000/api/conversations/${loggedInUser?.id}`, {
	  method: 'GET',
	  headers: {
		'Content-Type': 'application/json',
	  }
	});
	const resData = await res.json();
  
	const uniqueConversations = resData.reduce((acc, current) => {
	  const x = acc.find(item => item.user.email === current.user.email);
	  if (!x) {
		return acc.concat([{ ...current, unseenCount: 0 }]);
	  } else {
		return acc;
	  }
	}, []);
  
	localStorage.setItem('uniqueConversations', JSON.stringify(uniqueConversations));
	setConversations(uniqueConversations);
  };
  
  useEffect(() => {
	const storedConversations = JSON.parse(localStorage.getItem('uniqueConversations'));
	if (storedConversations) {
	  setConversations(storedConversations);
	} else {
	  fetchConversations();
	}
  }, []);
  
  useEffect(() => {
	const fetchUsers = async () => {
	  const res = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json',
		}
	  });
	  const resData = await res.json();
	  setUsers(resData);
	};
	fetchUsers();
  }, [user?.id]);
  
  const fetchMessages = async (conversationId, receiver) => {
	let id = conversationId;
	
	if (conversationId === 'new') {
	  const createConvoRes = await fetch(`http://localhost:8000/api/conversations`, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ senderId: user?.id, receiverId: receiver?.receiverId })
	  });
  
	  const createConvoData = await createConvoRes.json();
	  id = createConvoData.conversationId;
	}
  
	// Fetch messages for the conversation
	const res = await fetch(`http://localhost:8000/api/message/${id}?senderId=${user?.id}&receiverId=${receiver?.receiverId}`, {
	  method: 'GET',
	  headers: {
		'Content-Type': 'application/json',
	  }
	});
  
	const resData = await res.json();
	setMessages({ messages: resData, receiver, conversationId: id });
	fetchConversations();
  };
  
  const sendMessage = async () => {
	if (message.trim() === '') {
	  return;
	}
  
	const newMessage = {
	  senderId: user?.id,
	  receiverId: messages?.receiver?.receiverId,
	  message,
	  conversationId: messages?.conversationId,
	};
  
	setMessages(prev => ({
	  ...prev,
	  messages: [...prev.messages, { user: { id: user?.id }, message }],
	}));
	setMessage('');
  
	socket?.emit('sendMessage', newMessage);
  
	if (newMessage.conversationId === 'new') {
	  const createConvoRes = await fetch(`http://localhost:8000/api/conversations`, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ senderId: user?.id, receiverId: messages?.receiver?.receiverId })
	  });
  
	  const createConvoData = await createConvoRes.json();
	  newMessage.conversationId = createConvoData.conversationId;
	}
  
	await fetch(`http://localhost:8000/api/message`, {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify(newMessage)
	});
  
	fetchConversations();
  };
  
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === 'Return' || e.keyCode === 13) && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user:detail');
    localStorage.removeItem('user:token');
    localStorage.removeItem('uniqueConversations');
    navigate('/users/sign_in');
  };

  return (
    <div className='flex justify-center items-center min-h-[100vh] bg-image'>
  <div className="flex relative w-[90%] h-[90vh] shadow-lg  border border-main rounded-3xl overflow-none">
    {/* Left Section */}
    <div className="w-[35%] h-full bg-secondary border-r-2 border-main rounded-3xl ">
      <div className="flex items-center my-8 mx-10 ">
        <div><img src={pic} width={75} height={75} className="border border-primary p-[2px] rounded-full" alt="User Profile" /></div>
        <div className="ml-6">
          <h3 className="text-xl text-white font-bold">{user?.fullName}</h3>
          {/* <p className="text-lg text-white">My Account</p> */}
          <button onClick={handleLogout} className="text-md mt-1 font-bold text-[#fa9500]">Logout</button>
        </div>
      </div>
      <hr />
      <div className="mx-7 mt-10">
        <div className="text-main text-lg font-semibold">Messages</div>
        <div className='overflow-scroll h-[450px]'>
          {
            conversations.length > 0 ?
              conversations.map(({ conversationId, user, unseenCount }) => (
                <div className="flex items-center py-6 border-b border-b-gray-300" key={conversationId}>
                  <div className="cursor-pointer flex items-center" onClick={() => fetchMessages(conversationId, user)}>
                    <div><img src={pic} className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" alt="User Profile" /></div>
                    <div className="ml-6">
                      <h3 className="text-lg text-white font-semibold">{user?.fullName}</h3>
                      <p className="text-sm text-white text-gray-600">{user?.email}</p>
                      {/* {unseenCount > 0 && <div className="text-sm text-red-500">{unseenCount} new messages</div>} */}
                    </div>
                  </div>
                </div>
              )) : <div className="text-center text-white text-lg font-semibold mt-[90%]">No Conversations</div>
          }
        </div>
      </div>
    </div>

    {/* Middle Section */}
    <div className="w-[60%] h-full bg-white flex flex-col items-center rounded-3xl">
      {
        messages?.receiver?.fullName &&
        <div className="w-[75%] bg-secondary h-[80px] my-10 rounded-full flex items-center px-14 py-2">
          <div className="cursor-pointer"><img src={pic} width={60} height={60} className="rounded-full" alt="Receiver Profile" /></div>
          <div className="ml-6 mr-auto">
            <h3 className="text-lg text-white font-bold">{messages?.receiver?.fullName}</h3>
            <p className="text-sm font-light text-gray-600 text-white">{messages?.receiver?.email}</p>
          </div>
        </div>
      }
      <div className="h-[90%] w-[90%] overflow-scroll shadow-sm">
        <div className="absolute top-0 right-0">
          <img src="favicon.png" alt="Logo" className="w-[65px] h-18" />
        </div>
        <div className="p-20">
          {
            messages?.messages?.length > 0 ?
              messages.messages.map(({ message, user: { id } = {} }, index) => (
                <div className={`max-w-[55%] h-auto font-normal rounded-b-xl p-4 mb-9 text-white ${id === user?.id ? 'ml-auto bg-blacky text-white rounded-tl-xl' : 'mr-auto bg-light rounded-tr-xl text-primary'}`} key={index}>
                  <div className="message-content">
                  {message}
                  </div>
                </div>
              )) : <div className="text-center text-black font-semibold text-lg mt-[90%]">No Messages</div>
          }
          <div ref={messageRef} />
        </div>
      </div>
      {
        messages?.receiver?.fullName &&
        <div className="w-[80%] h-[200px] flex items-center">
          <Input
            placeholder="Type a message..."
            value={message}
            onKeyDown={handleKeyDown}
            onChange={(e) => setMessage(e.target.value)}
            className="w-[90%]"
            inputClassName="p-4 border-0 shadow-lg font-semibold rounded-full focus:ring-0 focus:border-0 outline-none"
          />
          <div className={`ml-7 p-2 cursor-pointer bg-light rounded-full ${!message && 'pointer-events-none'}`} onClick={sendMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-send" width="30" height="30" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <line x1="10" y1="14" x2="21" y2="3" />
              <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
            </svg>
          </div>
        </div>
      }
    </div>

    {/* Toggle Friends Section */}
    <div className={`w-[5%] h-full bg-light px-8 py-16 flex flex-col items-center justify-center border-l-2 border-main rounded-3xl`}>
      <button className="toggle-friends-button" onClick={() => setShowFriends(!showFriends)}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`icon icon-tabler icon-tabler-chevron-${showFriends ? 'left' : 'right'}`} width="40" height="40" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24h24H0z" fill="none"/>
          <polyline points="15 6 9 12 15 18" />
        </svg>
        <div className="text-white font-normal">{showFriends ? '' : 'Friend List'}</div>
      </button>
    </div>

    {/* Friend List Section */}
    <div className={`w-[25%] h-[90vh] bg-light fixed px-8 py-16  sidebar ${showFriends ? 'open' : ''}`}>
      <div className="flex justify-end">
        <button className="close-friends-button" onClick={() => setShowFriends(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24h24H0z" fill="none"/>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="text-main text-lg font-semibold">Friends</div>
      <div className='overflow-scroll h-[500px]'>
        {
          users.length > 0 ?
            users.map(({ userId, user }) => (
              <div className="flex items-center py-8 border-b border-b-gray-300" key={userId}>
                <div className="cursor-pointer flex items-center" onClick={() => fetchMessages('new', user)}>
                  <div><img src={pic} className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" alt="Friend Profile" /></div>
                  <div className="ml-6">
                    <h3 className="text-lg font-semibold text-white">{user?.fullName}</h3>
                    <p className="text-sm font-light text-white text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>
            )) : <div className="text-center text-white text-lg font-semibold mt-[90%]">No user found</div>
        }
      </div>
    </div>
  </div>
</div>

  );
}

export default Dashboard;
