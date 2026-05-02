import RequireAuth from '@/src/components/RequireAuth';
import SearchScreen from '@/src/screens/Search';

export default function SearchRoute() {
  return (
    <RequireAuth>
      <SearchScreen />
    </RequireAuth>
  );
}
