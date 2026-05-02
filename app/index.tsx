import HomeScreen from '../src/screens/HomeScreen';
import RequireAuth from '../src/components/RequireAuth';

export default function HomeRoute() {
  return (
    <RequireAuth>
      <HomeScreen />
    </RequireAuth>
  );
}
