import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SepFinderForm from '@/components/SepFinderForm';
import SepResults from '@/components/SepResults';
import { evaluateEnrollmentPeriods, type SepFinderInput, type EnrollmentPeriodResult } from '@/lib/sep-rules';

export default function SepFinder() {
  const [results, setResults] = useState<EnrollmentPeriodResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = (input: SepFinderInput) => {
    const evaluated = evaluateEnrollmentPeriods(input);
    // If agent indicated OEP was used, filter it out
    const filtered = input.usedOep ? evaluated.filter(r => r.id !== 'oep') : evaluated;
    setResults(filtered);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">SEP Finder</h1>
            <p className="text-sm text-muted-foreground">Enrollment Period Strategy Engine</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[400px_1fr]">
        <aside>
          <div className="sticky top-20">
            <SepFinderForm onSubmit={handleSubmit} />
          </div>
        </aside>
        <section>
          {hasSearched ? (
            <SepResults results={results} />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-center">
              <p>Enter beneficiary details on the left and click <strong>"Find Enrollment Periods"</strong> to see ranked results.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
