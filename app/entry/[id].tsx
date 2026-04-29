import RequireAuth from "../../src/components/RequireAuth";
import EntryDetailScreen from "../../src/screens/EntryDeatil";

export default function EntryDetailRoute() {
  return (
    <RequireAuth>
      <EntryDetailScreen />
    </RequireAuth>
  );
}
