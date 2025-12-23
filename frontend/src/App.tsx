import { useAuthStore } from './stores/authStore';
import { WalletConnect } from './components/auth/WalletConnect';
import { ChatsList } from './components/chat/ChatsList';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <ChatsList /> : <WalletConnect />;
}

export default App;
