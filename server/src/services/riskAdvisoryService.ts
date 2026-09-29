import { getShiftAnalysis } from './predictionService';

export const generateRiskAdvisory = async (workerId?: string) => {
  const shifts = await getShiftAnalysis(workerId);
  
  if (!shifts || shifts.length === 0) {
    return {
      advisory: "No historical data available to generate advisory.",
      highestRiskShift: "NONE"
    };
  }

  // Find shift with highest average H2S
  const sortedShifts = [...shifts].sort((a, b) => b.averageH2s - a.averageH2s);
  const highestRisk = sortedShifts[0];

  let patternDescriptor = "Normal";
  if (highestRisk.averageH2s > 10) patternDescriptor = "Elevated";
  else if (highestRisk.averageH2s > 5) patternDescriptor = "Cautionary";

  const advisory = `${patternDescriptor} exposure patterns have been observed during selected ${highestRisk.shift.toLowerCase()} monitoring periods. Review ventilation conditions, exposure duration and worker rotation practices according to applicable safety procedures.`;

  return {
    advisory,
    highestRiskShift: highestRisk.shift,
    trend: {
      historicalAverage: parseFloat((shifts.reduce((sum, s) => sum + s.averageH2s, 0) / 3).toFixed(1)),
      projectedPattern: patternDescriptor.toUpperCase()
    }
  };
};
