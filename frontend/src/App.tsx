import { useAuthStore } from './stores/authStore';
import { WalletConnect } from './components/auth/WalletConnect';
import { ChatRoom } from './components/chat/ChatRoom';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <ChatRoom /> : <WalletConnect />;
}

export default App;
