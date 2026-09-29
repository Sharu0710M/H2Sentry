import { Request, Response } from 'express';
import { getShiftAnalysis } from '../services/predictionService';
import { generateRiskAdvisory } from '../services/riskAdvisoryService';

export const getPredictionData = async (req: Request, res: Response) => {
  try {
    const workerId = req.query.workerId as string | undefined;
    const shifts = await getShiftAnalysis(workerId);
    const advisory = await generateRiskAdvisory(workerId);

    res.json({
      shifts,
      advisory: advisory.advisory,
      highestRiskShift: advisory.highestRiskShift,
      trend: advisory.trend
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
