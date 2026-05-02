import RequireAuth from '@/src/components/RequireAuth';
import ProfileScreen from '@/src/screens/Profile';

export default function ProfileRoute() {
  return (
    <RequireAuth>
      <ProfileScreen />
    </RequireAuth>
  );
}
