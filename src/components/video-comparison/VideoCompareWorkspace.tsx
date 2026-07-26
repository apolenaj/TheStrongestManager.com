import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { VideoComparisonResult } from "@/domain/video-comparison";
import { SideBySideComparePlayer } from "@/components/video-comparison/SideBySideComparePlayer";

export function VideoCompareWorkspace({
  result,
}: {
  result: VideoComparisonResult;
}) {
  return (
    <div className="grid gap-6">
      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Side-by-side</Badge>
            <Badge variant="neutral">{result.engineVersion}</Badge>
          </div>
          <CardTitle className="mt-2 text-2xl tracking-tight">
            Old lift vs new lift
          </CardTitle>
          <CardDescription>
            Synchronized playback with pause, frame step, speed, optional
            overlay, and landmark toggle — usable on mobile.
          </CardDescription>
        </CardHeader>
      </Card>

      {result.emptyReason ? (
        <Card>
          <CardHeader>
            <CardTitle>Comparison unavailable</CardTitle>
            <CardDescription>{result.emptyReason}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <SideBySideComparePlayer result={result} />
      )}
    </div>
  );
}
