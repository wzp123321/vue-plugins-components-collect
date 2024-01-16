export declare type TDeepReadonly<T> = {
    readonly [K in keyof T]: TDeepReadonly<T[K]>;
};
export declare type TDeepPartial<T> = {
    [K in keyof T]?: TDeepPartial<T[K]>;
};
export declare const enum EKeyCode {
    Esc = "Escape",
    F1 = "F1",
    F2 = "F2",
    F3 = "F3",
    F4 = "F4",
    F5 = "F5",
    F6 = "F6",
    F7 = "F7",
    F8 = "F8",
    F9 = "F9",
    F10 = "F10",
    F11 = "F11",
    F12 = "F12",
    '`~' = "Backquote",
    '1!' = "Digit1",
    '2@' = "Digit2",
    '3#' = "Digit3",
    '4$' = "Digit4",
    '5%' = "Digit5",
    '6^' = "Digit6",
    '7&' = "Digit7",
    '8*' = "Digit8",
    '9(' = "Digit9",
    '0)' = "Digit0",
    '-_' = "Minus",
    '=+' = "Equal",
    Backspace = "Backspace",
    Tab = "Tab",
    Q = "KeyQ",
    W = "KeyW",
    E = "KeyE",
    R = "KeyR",
    T = "KeyT",
    Y = "KeyY",
    U = "KeyU",
    I = "KeyI",
    O = "KeyO",
    P = "KeyP",
    '[{' = "BracketLeft",
    ']}' = "BracketRight",
    '\\|' = "Backslash",
    CapsLock = "CapsLock",
    A = "KeyA",
    S = "KeyS",
    D = "KeyD",
    F = "KeyF",
    G = "KeyG",
    H = "KeyH",
    J = "KeyJ",
    K = "KeyK",
    L = "KeyL",
    ';:' = "Semicolon",
    '\'"' = "Quote",
    Enter = "Enter",
    ShiftLeft = "ShiftLeft",
    Z = "KeyZ",
    X = "KeyX",
    C = "KeyC",
    V = "KeyV",
    B = "KeyB",
    N = "KeyN",
    M = "KeyM",
    ',<' = "Comma",
    '.>' = "Period",
    '/?' = "Slash",
    ShiftRight = "ShiftRight",
    ControlLeft = "ControlLeft",
    WinLeft = "MetaLeft",
    AltLeft = "AltLeft",
    Space = "Space",
    AltRight = "AltRight",
    WinRight = "MetaRight",
    ControlRight = "ControlRight",
    ArrowUp = "ArrowUp",
    ArrowRight = "ArrowRight",
    ArrowDown = "ArrowDown",
    ArrowLeft = "ArrowLeft",
    PrintScreen = "PrintScreen",
    ScrollLock = "ScrollLock",
    PauseBreak = "Pause",
    Insert = "Insert",
    Home = "Home",
    PageUp = "PageUp",
    Delete = "Delete",
    End = "End",
    PageDown = "PageDown"
}
export interface ISize {
    width: number;
    height: number;
}
