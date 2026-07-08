import { CSVWizard } from "@/components/CSVWizard";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center p-4 bg-zinc-50">
      <CSVWizard />
    </div>
  );
}
