import React, { useState, useEffect } from 'react';

export interface RoundRecord {
  round: number;
  winnerTeamId: string;
  durationSeconds: number;
  team1ActiveSeconds: number;
  team2ActiveSeconds: number;
  isExtraRound?: boolean;
}

export interface RefereeScorecardProps {
  arenaName?: string;
  matchPhase?: string;
  team1?: { id: string; name: string; color: string; score: number };
  team2?: { id: string; name: string; color: string; score: number };
  onFinishMatch?: (winnerId: string, rounds: RoundRecord[]) => void;
}

export const RefereeScorecard: React.FC<RefereeScorecardProps> = ({
  arenaName = 'Arena Alpha (Principal)',
  matchPhase = 'Quartas de Final - Melhor de 3',
  team1 = { id: 'team-1', name: 'Robô Fênix', color: '#ef4444', score: 0 },
  team2 = { id: 'team-2', name: 'Titanbot', color: '#3b82f6', score: 0 },
  onFinishMatch,
}) => {
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [team1Score, setTeam1Score] = useState<number>(team1.score);
  const [team2Score, setTeam2Score] = useState<number>(team2.score);
  const [roundTimer, setRoundTimer] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [team1ActiveTime, setTeam1ActiveTime] = useState<number>(0);
  const [team2ActiveTime, setTeam2ActiveTime] = useState<number>(0);
  const [roundsHistory, setRoundsHistory] = useState<RoundRecord[]>([]);
  const [matchStatus, setMatchStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'FINISHED'>('PENDING');
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && roundTimer > 0) {
      interval = setInterval(() => {
        setRoundTimer((prev) => prev - 1);
        setTeam1ActiveTime((prev) => prev + 1);
        setTeam2ActiveTime((prev) => prev + 1);
      }, 1000);
    } else if (roundTimer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, roundTimer]);

  const handleAwardPoint = (winnerTeamId: string) => {
    const isTeam1 = winnerTeamId === team1.id;
    const newT1 = isTeam1 ? team1Score + 1 : team1Score;
    const newT2 = !isTeam1 ? team2Score + 1 : team2Score;

    if (isTeam1) setTeam1Score(newT1);
    else setTeam2Score(newT2);

    const record: RoundRecord = {
      round: currentRound,
      winnerTeamId,
      durationSeconds: 60 - roundTimer,
      team1ActiveSeconds: team1ActiveTime,
      team2ActiveSeconds: team2ActiveTime,
      isExtraRound: currentRound > 3,
    };
    const updatedHistory = [...roundsHistory, record];
    setRoundsHistory(updatedHistory);

    if (newT1 >= 2 || newT2 >= 2) {
      const matchWinner = newT1 >= 2 ? team1.id : team2.id;
      setWinner(matchWinner);
      setMatchStatus('FINISHED');
      setIsTimerRunning(false);
      if (onFinishMatch) {
        onFinishMatch(matchWinner, updatedHistory);
      }
    } else {
      setCurrentRound((prev) => prev + 1);
      setRoundTimer(60);
      setTeam1ActiveTime(0);
      setTeam2ActiveTime(0);
      setIsTimerRunning(false);
    }
  };

  const handleHansoku = (penalizedTeamId: string) => {
    const opposingTeamId = penalizedTeamId === team1.id ? team2.id : team1.id;
    handleAwardPoint(opposingTeamId);
  };

  const handleTiebreaker = () => {
    const tieWinner = team1ActiveTime >= team2ActiveTime ? team1.id : team2.id;
    handleAwardPoint(tieWinner);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
            {arenaName}
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            Súmula Digital de Arbitragem
          </h1>
          <p className="text-sm text-slate-400">{matchPhase}</p>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            matchStatus === 'FINISHED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
            matchStatus === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse' :
            'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {matchStatus === 'FINISHED' ? 'Finalizada' : matchStatus === 'IN_PROGRESS' ? 'Em Combate' : 'Aguardando Início'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-center bg-slate-950/60 p-6 rounded-xl border border-slate-800/80">
        <div className="text-center md:text-left">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Round Atual</span>
          <div className="text-3xl font-black text-amber-400">Round {currentRound} <span className="text-sm font-normal text-slate-500">(Melhor de 3)</span></div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Tempo de Ringue</span>
          <div className="text-5xl font-mono font-black tracking-widest text-white">
            00:{roundTimer < 10 ? `0${roundTimer}` : roundTimer}
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => { setIsTimerRunning(!isTimerRunning); setMatchStatus('IN_PROGRESS'); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                isTimerRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isTimerRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              onClick={() => { setIsTimerRunning(false); setRoundTimer(60); }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Resetar
            </button>
          </div>
        </div>

        <div className="text-center md:text-right">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Placar da Série</span>
          <div className="text-3xl font-black text-white font-mono">{team1Score} - {team2Score}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-b from-red-950/20 to-slate-950 border border-red-500/30 hover:border-red-500/60 transition">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/20">
                Corner Vermelho (Aka)
              </span>
              <h2 className="text-2xl font-black text-white mt-1">{team1.name}</h2>
            </div>
            <div className="text-4xl font-mono font-black text-red-400">{team1Score}</div>
          </div>
          <div className="text-xs text-slate-400 mb-4 flex justify-between">
            <span>Permanência ativa: <strong className="text-slate-200">{team1ActiveTime}s</strong></span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={matchStatus === 'FINISHED'}
              onClick={() => handleAwardPoint(team1.id)}
              className="py-2.5 px-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition shadow-lg shadow-red-950/40"
            >
              Ippon / Vitória (+1)
            </button>
            <button
              disabled={matchStatus === 'FINISHED'}
              onClick={() => handleHansoku(team1.id)}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-red-300 font-bold rounded-lg text-xs transition border border-red-900/50"
            >
              Penalidade (Hansoku)
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/20 to-slate-950 border border-blue-500/30 hover:border-blue-500/60 transition">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/20">
                Corner Azul (Shiro)
              </span>
              <h2 className="text-2xl font-black text-white mt-1">{team2.name}</h2>
            </div>
            <div className="text-4xl font-mono font-black text-blue-400">{team2Score}</div>
          </div>
          <div className="text-xs text-slate-400 mb-4 flex justify-between">
            <span>Permanência ativa: <strong className="text-slate-200">{team2ActiveTime}s</strong></span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={matchStatus === 'FINISHED'}
              onClick={() => handleAwardPoint(team2.id)}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition shadow-lg shadow-blue-950/40"
            >
              Ippon / Vitória (+1)
            </button>
            <button
              disabled={matchStatus === 'FINISHED'}
              onClick={() => handleHansoku(team2.id)}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-blue-300 font-bold rounded-lg text-xs transition border border-blue-900/50"
            >
              Penalidade (Hansoku)
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={handleTiebreaker}
          disabled={matchStatus === 'FINISHED'}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition flex items-center space-x-2"
        >
          <span>⚖️ Desempate Automático (Tempo de Permanência)</span>
        </button>

        {winner && (
          <div className="flex items-center space-x-3 bg-emerald-950/50 border border-emerald-500/40 px-4 py-2 rounded-xl">
            <span className="text-emerald-400 text-xs font-bold">Vencedor Oficial:</span>
            <span className="text-white font-black text-sm">{winner === team1.id ? team1.name : team2.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefereeScorecard;
