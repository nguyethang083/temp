/**
 * Basic type declarations for webidl-conversions.
 * This is a simplified version to resolve TypeScript errors.
 */

declare module 'webidl-conversions' {
  export default function(): any;
  export function any(): any;
  export function void(): void;
  export function boolean(): boolean;
  export function byte(): number;
  export function octet(): number;
  export function short(): number;
  export function unsigned_short(): number;
  export function long(): number;
  export function unsigned_long(): number;
  export function long_long(): number;
  export function unsigned_long_long(): number;
  export function float(): number;
  export function unrestricted_float(): number;
  export function double(): number;
  export function unrestricted_double(): number;
  export function DOMString(): string;
  export function ByteString(): string;
  export function USVString(): string;
  export function object(): object;
  export function ArrayBuffer(): ArrayBuffer;
  export function DataView(): DataView;
  export function Int8Array(): Int8Array;
  export function Int16Array(): Int16Array;
  export function Int32Array(): Int32Array;
  export function Uint8Array(): Uint8Array;
  export function Uint16Array(): Uint16Array;
  export function Uint32Array(): Uint32Array;
  export function Uint8ClampedArray(): Uint8ClampedArray;
  export function Float32Array(): Float32Array;
  export function Float64Array(): Float64Array;
  export function ArrayBufferView(): ArrayBufferView;
  export function BufferSource(): ArrayBuffer | ArrayBufferView;
  export function DOMTimeStamp(): number;
} 