export const clamp = (value:number) => Math.max(0, Math.min(1, value));
const ease = (value:number) => {const t=clamp(value); return t*t*(3-2*t)};
export function heroMotion(progress:number, reduced=false){
  const p=clamp(progress);
  return {
    body: reduced?1:ease((p-.075)/.69),
    headlights: reduced?1:ease(p/.065)*(.72+.28*ease((p-.76)/.13)),
    sweep: 115-ease((p-.16)/.56)*145,
    reflection: reduced?0:Math.sin(Math.PI*clamp((p-.16)/.56))*.12,
    camera: reduced?1:1+.055*p,
    shift: reduced?0:-.7*p,
    depth: reduced?0:-.55*p,
    title: reduced?1:ease((p-.83)/.065),
    exit: reduced?0:ease((p-.955)/.045),
    stories: [0.055,.25,.445,.64].map(start=>reduced?0:ease((p-start)/.035)*(1-ease((p-start-.12)/.045))),
  };
}
