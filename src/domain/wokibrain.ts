import { DateTime } from "luxon";
import {
  CandidateKind,
  Candidate,
  Table,
  IGap,
} from "./types";

export class WokiBrain {
  constructor(
    private readonly durationMinutes: number,
    private readonly partySize: number,
  ) {}

  public generateCandidates(
    baseDay: DateTime,
    tables: Table[],
    gapsByTable: Map<string, IGap[]>,
  ): Candidate[] {
    const candidates: Candidate[] = [];

    // 1-Single table
    for (const table of tables) {
      const gaps = gapsByTable.get(table.id) ?? [];
      if (!this.validPartySize(table.minSize, table.maxSize)) continue;

      for (const gap of gaps) {
        if (!this.validGap(gap)) continue;
        candidates.push(this.makeCandidate([table], baseDay, gap.startMin));
      }
    }

    // 2-Combo tables: combination of two tables
    const MAX_NEARBY_TABLES = 2; // It has to be tables.length > MAX_NEARBY_TABLES to restrict the combos.

    for (let i = 0; i < tables.length; i++) {
      for (let j  = i + 1; j <=( i + MAX_NEARBY_TABLES); j++) {
        if (j >= tables.length) break;

        const t1 = tables[i];
        const t2 = tables[j];

        const cap = this.getCapacity([t1, t2]);  
        if (!this.validPartySize(cap.min, cap.max)) continue;

        const overlapGaps = this.intersectGaps(
          gapsByTable.get(t1.id) ?? [],
          gapsByTable.get(t2.id) ?? [],
        );

        for (const gap of overlapGaps) {
          if (!this.validGap(gap)) continue;
          candidates.push(this.makeCandidate([t1, t2], baseDay, gap.startMin));
        }
      }
    }

    return candidates;
  }

  /**
   * Selects the best candidate following a deterministic priority:
   *
   *  1) Prefer SINGLE candidates over COMBO candidates.
   *  2) Prefer candidates with the least capacity waste (capacityMax - partySize).
   *  3) Prefer the earliest available start time.
   */
  public selectBestCandidate(candidates: Candidate[]): Candidate | null {
    if (!candidates.length) return null;

    return candidates.sort((a, b) => {
      // Prefer single
      if (a.kind !== b.kind) {
        return a.kind === CandidateKind.SINGLE ? -1 : 1;
      }

      // Less capacity waste
      const wasteA = a.capacityMax - this.partySize;
      const wasteB = b.capacityMax - this.partySize;
      if (wasteA !== wasteB) return wasteA - wasteB;

      // Default: Earliest start time
        return a.startISO.localeCompare(b.startISO);
    })[0];
  }

  private getCapacity(tables: Table[]): { min: number; max: number } {
    const min = tables.reduce((acc, t) => acc + t.minSize, 0);
    const max = tables.reduce((acc, t) => acc + t.maxSize, 0);
    return { min, max };
  }

  private validGap(gap: IGap): boolean {
    return gap.endMin - gap.startMin >= this.durationMinutes;
  }

  private validPartySize(capMin: number, capMax: number): boolean {
    return this.partySize >= capMin && this.partySize <= capMax;
  }

  private makeCandidate(
    tables: Table[],
    baseDay: DateTime,
    startMin: number,
  ): Candidate {
    const start = baseDay.plus({ minutes: startMin });
    const end = start.plus({ minutes: this.durationMinutes });
    const capacity = this.getCapacity(tables);

    return {
      kind: tables.length === 1 ? CandidateKind.SINGLE : CandidateKind.COMBO,
      tableIds: tables.map((t) => t.id),
      startISO: start.toISO()!,
      endISO: end.toISO()!,
      capacityMin: capacity.min,
      capacityMax: capacity.max,
    };
  }

  private intersectGaps(gapsA: IGap[], gapsB: IGap[]): IGap[] {
    const intersections: IGap[] = [];
    let i = 0;
    let j = 0;
  
    while (i < gapsA.length && j < gapsB.length) {
      const { startMin: startA, endMin: endA } = gapsA[i];
      const { startMin: startB, endMin: endB } = gapsB[j];
  
      const startMin = Math.max(startA, startB);
      const endMin = Math.min(endA, endB);
  
      if (endMin > startMin) {
        intersections.push({ startMin, endMin });
      }
  
      if (endA < endB) {
        i++;
      } else {
        j++;
      }
    }
  
    return intersections;
  }
}
