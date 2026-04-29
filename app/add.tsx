import AddScreen from '../src/screens/AddScreen';
import RequireAuth from '../src/components/RequireAuth';

export default function AddRoute() {
  return (
    <RequireAuth>
      <AddScreen />
    </RequireAuth>
  );
}
