import RequireAuth from '@/src/components/RequireAuth';
import MyJournalScreen from '@/src/screens/MyJournal';

export default function JournalRoute() {
  return (
    <RequireAuth>
      <MyJournalScreen />
    </RequireAuth>
  );
}
