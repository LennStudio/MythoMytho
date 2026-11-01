import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { formatClock } from '@/domain';
import { buzz, playTimerEnd } from '@/services/feedback';
import { AppText, Button, Panel } from '../ui/primitives';

/** Minuteur de discussion : démarre quand toutes les cartes sont vues, borné par l'horloge (pas de dérive). */
export function DiscussionTimer({ minutes, sound, active, resetKey, onRunningChange }: {
  minutes: number; sound: boolean; active: boolean; resetKey: number; onRunningChange?: (running: boolean) => void;
}): React.JSX.Element | null {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const endAt = useRef(0);

  useEffect(() => { setLeft(total); setRunning(false); setStarted(false); }, [resetKey, total]);
  useEffect(() => {
    if (active && !started) { endAt.current = Date.now() + total * 1000; setStarted(true); setRunning(true); }
  }, [active, started, total]);
  useEffect(() => { onRunningChange?.(running); }, [running, onRunningChange]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        setRunning(false);
        buzz([200, 100, 200, 100, 400]);
        if (sound) playTimerEnd();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, sound]);

  const toggle = useCallback(() => {
    if (running) setRunning(false);
    else if (left > 0) { endAt.current = Date.now() + left * 1000; setRunning(true); }
  }, [running, left]);

  if (!started) return null;
  return (
    <Panel style={{ alignItems: 'center', gap: 8 }}>
      <AppText tone="muted" size={13}>Discussion</AppText>
      <AppText bold size={44}>{formatClock(left)}</AppText>
      {left === 0 ? <AppText tone="red" bold>Temps écoulé — place au vote !</AppText> : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button small variant="ghost" label={running ? 'Pause' : 'Reprendre'} onPress={toggle} disabled={left === 0} />
        <Button small variant="ghost" label="Recommencer" onPress={() => { endAt.current = Date.now() + total * 1000; setLeft(total); setRunning(true); }} />
      </View>
    </Panel>
  );
}
