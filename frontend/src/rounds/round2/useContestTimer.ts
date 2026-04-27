import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export function useContestTimer(roundKey: string) {
  const navigate = useNavigate();
  const [contestEndMs, setContestEndMs] = useState<number | null>(null);
  const [contestEnded, setContestEnded] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get(`/game/config/round/${roundKey}`);
        if (res.data.playWindowEnd) {
          const endMs = new Date(res.data.playWindowEnd).getTime();
          if (endMs > Date.now()) {
            setContestEndMs(endMs);
          } else {
            setContestEnded(true);
          }
        }
      } catch (e) {
        console.error('Failed to fetch round config:', e);
      }
    };
    fetchConfig();
  }, [roundKey]);

  useEffect(() => {
    if (contestEndMs && Date.now() >= contestEndMs && !checkedRef.current) {
      checkedRef.current = true;
      setContestEnded(true);
      return;
    }
    if (!contestEndMs || contestEnded) return;

    const interval = setInterval(() => {
      if (Date.now() >= contestEndMs && !checkedRef.current) {
        checkedRef.current = true;
        setContestEnded(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [contestEndMs, contestEnded]);

  // Auto-redirect when contest ends
  useEffect(() => {
    if (contestEnded) {
      const timeout = setTimeout(() => {
        navigate('/competition/round2');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [contestEnded, navigate]);

  return { contestEndMs, contestEnded };
}
