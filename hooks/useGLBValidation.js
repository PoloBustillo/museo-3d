import { useState } from "react";
import { validateGLB, diagnoseModel } from "@/utils/validateGLB";

export function useGLBValidation() {
  const [result, setResult] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = async (blob) => {
    setLoading(true);
    setResult(null);
    setDiagnosis(null);
    const validation = await validateGLB(blob);
    setResult(validation);
    if (validation.isValid) {
      const diag = await diagnoseModel(blob);
      setDiagnosis(diag);
    } else {
      setDiagnosis(null);
    }
    setLoading(false);
    return validation;
  };

  return { result, diagnosis, loading, validate };
} 