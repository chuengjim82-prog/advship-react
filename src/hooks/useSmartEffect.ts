import { useEffect, useRef } from "react";

type Key = string | number | null | undefined;

interface SmartEffectOptions<T extends Key = Key> {
  /** 是否启用（如 visible） */
  enabled?: boolean;

  /** 是否只执行一次（页面级） */
  once?: boolean;

  /** 根据 key 变化执行（如 orderId） */
  key?: T | null;

  /** 副作用逻辑 */
  effect: (key?: T | undefined) => void;

  /** 关闭 / 禁用时触发 */
  onReset?: () => void;
}

export function useSmartEffect<T extends Key = Key>({
  enabled = true,
  once = false,
  key,
  effect,
  onReset,
}: SmartEffectOptions<T>) {
  const onceRef = useRef(false);
  const lastKeyRef = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) {
      lastKeyRef.current = null;
      onceRef.current = false;
      onReset?.();
      return;
    }

    // once 模式
    if (once) {
      if (onceRef.current) return;
      onceRef.current = true;
      effect(key ?? undefined);
      return;
    }

    // key 模式
    if (key !== undefined) {
      if (key == null) {
        lastKeyRef.current = null;
        onReset?.();
        return;
      }

      if (lastKeyRef.current === key) return;
      lastKeyRef.current = key;
      effect(key);
      return;
    }

    // 普通 enabled 模式
    effect(key ?? undefined);
  }, [enabled, once, key, effect, onReset]);
}
