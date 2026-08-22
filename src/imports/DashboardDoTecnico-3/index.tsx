import svgPaths from "./svg-ngc0puzya7";

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c4f00] text-[12px] tracking-[1.2px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">TEAM PROFILE</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <div className="bg-[#fd9923] relative rounded-[12px] shrink-0 size-[8px]" data-name="Background" />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#051d30] text-[48px] tracking-[-2.4px] whitespace-nowrap">
        <p className="leading-[48px]">CyberBots Alpha</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[18px] whitespace-nowrap">
        <p>
          <span className="leading-[28px]">{`Verification status: `}</span>
          <span className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[28px] not-italic text-[#8c4f00]">Pending Approval</span>
        </p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0" data-name="Container">
      <Container1 />
      <Heading />
      <Container3 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#424751] text-[14px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">ARENA REGISTRATIONS</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#051d30] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Battle Arena A</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#394e63] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[2px] shrink-0" data-name="Background">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#a9bfd8] text-[10px] whitespace-nowrap">
        <p className="leading-[15px]">CONFIRMED</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Background />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container5 />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[74.024px] right-[-16px] top-[-16px] w-[72.127px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="74.0235" preserveAspectRatio="none" viewBox="0 0 72.1273 74.0235" width="72.1273">
        <g id="Container" opacity="0.05">
          <path d={svgPaths.p68a5640} fill="#051D30" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ArenaSummaryCard() {
  return (
    <div className="bg-[#edf4ff] content-stretch flex flex-col gap-[16px] items-start min-w-[320px] overflow-clip p-[24px] relative rounded-[8px] shrink-0 w-[440px]" data-name="Arena Summary Card">
      <Heading2 />
      <Container4 />
      <Container7 />
    </div>
  );
}

function HeaderSection() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Header Section">
      <Container />
      <ArenaSummaryCard />
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[18px] relative shrink-0 w-[30px]" data-name="Margin">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 30 18" width="30">
        <g id="Margin">
          <path d={svgPaths.p8a35e00} fill="#727782" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] w-full">
        <p className="leading-[normal]">Buscar por nome do Participante</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pb-[10px] pt-[9px] px-[12px] relative size-full">
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[24px] relative size-full">
          <Margin />
          <Input />
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#00356a] content-stretch flex flex-col items-center justify-center px-[32px] py-[10px] relative rounded-[12px] shrink-0" data-name="Button">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white tracking-[0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">FILTRAR</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#edf4ff] col-[1/span_8] h-[44px] justify-self-stretch relative rounded-[12px] row-1 shrink-0" data-name="Background">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[4px] relative size-full">
          <Container8 />
          <Button />
        </div>
      </div>
    </div>
  );
}

function FiltersSearch() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_44px] relative shrink-0 w-full" data-name="Filters & Search">
      <Background1 />
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 size-[16.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="16.6667" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667" width="16.6667">
        <g id="Container">
          <path d={svgPaths.pc17f800} fill="#1E3A8A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(30,58,138,0.1)] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" data-name="Overlay">
      <Container11 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[20px] whitespace-nowrap">
        <p className="leading-[28px]">Participant Roster</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Overlay />
        <Heading1 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[7px] relative shrink-0 w-[10.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="7" preserveAspectRatio="none" viewBox="0 0 10.5 7" width="10.5">
        <g id="Container">
          <path d={svgPaths.p3592ed80} fill="#1E3A8A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[4px] shrink-0" data-name="Button">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[17px] py-[9px] relative size-full">
        <Container12 />
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1e3a8a] text-[12px] text-center tracking-[1.2px] uppercase whitespace-nowrap">
          <p className="leading-[16px]">FILTER ROLES</p>
        </div>
      </div>
    </div>
  );
}

function OverlayHorizontalBorder() {
  return (
    <div className="bg-[rgba(248,250,252,0.5)] relative shrink-0 w-full" data-name="Overlay+HorizontalBorder">
      <div aria-hidden className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[25px] pt-[24px] px-[32px] relative size-full">
          <Container10 />
          <Button1 />
        </div>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#eff6ff] content-stretch flex h-[48px] items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[8px] shrink-0 w-[39.5px]" data-name="Background">
      <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0)] h-[48px] left-0 rounded-[8px] shadow-[0px_0px_0px_4px_white,0px_1px_2px_0px_rgba(0,0,0,0.05)] top-1/2 w-[39.5px]" data-name="Overlay+Shadow" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2563eb] text-[18px] text-center whitespace-nowrap">
        <p className="leading-[28px]">RM</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] whitespace-nowrap">
        <p className="leading-[24px] mb-0">Ricardo</p>
        <p className="leading-[24px]">Mendes</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">ID: 489.223.11-09</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Container">
      <Container14 />
      <Container15 />
    </div>
  );
}

function Data() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-[163.59px]" data-name="Data">
      <Background2 />
      <Container13 />
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#ff424c] content-stretch flex items-start px-[12px] py-[4px] relative rounded-[12px] shrink-0" data-name="Background">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[11px] tracking-[-0.55px] uppercase whitespace-nowrap">
        <p className="leading-[normal]">Revisar documentos</p>
      </div>
    </div>
  );
}

function Data1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[50.5px] pl-[40px] pr-[32px] pt-[50px] relative shrink-0 w-[176.08px]" data-name="Data">
      <Background3 />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[15px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="15" preserveAspectRatio="none" viewBox="0 0 12 15" width="12">
        <g id="Container">
          <path d={svgPaths.p292bd880} fill="#2563EB" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#eff6ff] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <Container17 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[8px] tracking-[-0.4px] uppercase whitespace-nowrap">
        <p className="leading-[normal]">IDENTITY</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative self-stretch shrink-0" data-name="Container">
      <Background4 />
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[14.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="14.25" preserveAspectRatio="none" viewBox="0 0 16.5 14.25" width="16.5">
        <g id="Container">
          <path d={svgPaths.p31d03480} fill="#2563EB" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#eff6ff] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <Container20 />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[8px] tracking-[-0.4px] uppercase whitespace-nowrap">
        <p className="leading-[normal]">IMAGE RIGHTS</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative self-stretch shrink-0" data-name="Container">
      <Background5 />
      <Container21 />
    </div>
  );
}

function Data2() {
  return (
    <div className="content-stretch flex gap-[24px] items-start justify-center relative shrink-0 w-[114.88px]" data-name="Data">
      <Container16 />
      <Container19 />
    </div>
  );
}

function Data3() {
  return (
    <div className="h-[18px] relative shrink-0 w-[269px]" data-name="Data">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 269 18" width="269">
        <g id="Data">
          <path d={svgPaths.p81a46c0} fill="#CBD5E1" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function RowRicardoMendes() {
  return (
    <div className="content-stretch flex gap-[228px] items-center justify-center mb-[-1px] relative shrink-0 w-full" data-name="Row - Ricardo Mendes">
      <Data />
      <Data1 />
      <Data2 />
      <Data3 />
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#eff6ff] content-stretch flex h-[48px] items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[8px] shrink-0 w-[39.5px]" data-name="Background">
      <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0)] h-[48px] left-0 rounded-[8px] shadow-[0px_0px_0px_4px_white,0px_1px_2px_0px_rgba(0,0,0,0.05)] top-1/2 w-[39.5px]" data-name="Overlay+Shadow" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ea580c] text-[18px] text-center whitespace-nowrap">
        <p className="leading-[28px]">JS</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] whitespace-nowrap">
        <p className="leading-[24px] mb-0">Juliana</p>
        <p className="leading-[24px]">Silva</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">ID: 489.223.11-09</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Container">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Data4() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-[163.59px]" data-name="Data">
      <Background6 />
      <Container22 />
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#2dce38] content-stretch flex items-center px-[12px] py-[4px] relative rounded-[12px] shrink-0 w-[166px]" data-name="Background">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[11px] tracking-[-0.55px] uppercase whitespace-nowrap">
        <p className="leading-[normal]">Documentos Corretos</p>
      </div>
    </div>
  );
}

function Data5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pb-[50.5px] pl-[40px] pr-[32px] pt-[50px] relative shrink-0 w-[191px]" data-name="Data">
      <Background7 />
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[15px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="15" preserveAspectRatio="none" viewBox="0 0 12 15" width="12">
        <g id="Container">
          <path d={svgPaths.p292bd880} fill="#2563EB" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#eff6ff] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <Container26 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[8px] tracking-[-0.4px] uppercase whitespace-nowrap">
        <p className="leading-[normal]">IDENTITY</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative self-stretch shrink-0" data-name="Container">
      <Background8 />
      <Container27 />
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[14.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="14.25" preserveAspectRatio="none" viewBox="0 0 16.5 14.25" width="16.5">
        <g id="Container">
          <path d={svgPaths.p31d03480} fill="#2563EB" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-[#eff6ff] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <Container29 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[8px] tracking-[-0.4px] uppercase whitespace-nowrap">
        <p className="leading-[normal]">IMAGE RIGHTS</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative self-stretch shrink-0" data-name="Container">
      <Background9 />
      <Container30 />
    </div>
  );
}

function Data6() {
  return (
    <div className="content-stretch flex gap-[24px] items-start justify-center relative shrink-0 w-[114.88px]" data-name="Data">
      <Container25 />
      <Container28 />
    </div>
  );
}

function Data8() {
  return (
    <div className="h-[18px] relative shrink-0 w-[295.45px]" data-name="Data">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 295.45 18" width="295.45">
        <g id="Data">
          <path d={svgPaths.p38249500} fill="#CBD5E1" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Data7() {
  return (
    <div className="content-stretch flex items-start justify-end pl-[40px] relative shrink-0 w-[278px]" data-name="Data">
      <Data8 />
    </div>
  );
}

function RowRicardoMendes1() {
  return (
    <div className="content-stretch flex gap-[225px] items-center justify-center mb-[-1px] relative shrink-0 w-full" data-name="Row - Ricardo Mendes">
      <Data4 />
      <Data5 />
      <Data6 />
      <Data7 />
    </div>
  );
}

function Background10() {
  return (
    <div className="bg-[#eff6ff] content-stretch flex h-[48px] items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[8px] shrink-0 w-[46.16px]" data-name="Background">
      <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0)] h-[48px] left-0 rounded-[8px] shadow-[0px_0px_0px_4px_white,0px_1px_2px_0px_rgba(0,0,0,0.05)] top-1/2 w-[46.16px]" data-name="Overlay+Shadow" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2563eb] text-[18px] text-center whitespace-nowrap">
        <p className="leading-[28px]">LT</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] whitespace-nowrap">
        <p className="leading-[24px] mb-0">Lucas</p>
        <p className="leading-[24px]">Torres</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] whitespace-nowrap">
        <p className="leading-[16px] mb-0">ID: 112.334.44-</p>
        <p className="leading-[16px]">87</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Container">
      <Container32 />
      <Container33 />
    </div>
  );
}

function Data9() {
  return (
    <div className="relative shrink-0 w-[163.59px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[20px] items-center relative size-full">
        <Background10 />
        <Container31 />
      </div>
    </div>
  );
}

function ParagraphBackground() {
  return (
    <div className="bg-[#f1f5f9] h-[36px] relative rounded-[12px] shrink-0 w-[151px]" data-name="Paragraph+Background">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[19.41px] not-italic text-[#475569] text-[11px] top-[11px] tracking-[-0.55px] uppercase w-[120px]">
        <p className="leading-[normal]">Agurdando Analize</p>
      </div>
    </div>
  );
}

function Data10() {
  return (
    <div className="relative shrink-0 w-[176.08px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[51px] pl-[40px] pr-[32px] pt-[51.5px] relative size-full">
        <ParagraphBackground />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[15px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="15" preserveAspectRatio="none" viewBox="0 0 12 15" width="12">
        <g id="Container">
          <path d={svgPaths.p292bd880} fill="#2563EB" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background11() {
  return (
    <div className="bg-[#eff6ff] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <Container35 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[8px] tracking-[-0.4px] uppercase whitespace-nowrap">
        <p className="leading-[normal]">IDENTITY</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative self-stretch shrink-0" data-name="Container">
      <Background11 />
      <Container36 />
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[14.25px] relative shrink-0 w-[16.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="14.25" preserveAspectRatio="none" viewBox="0 0 16.5 14.25" width="16.5">
        <g id="Container">
          <path d={svgPaths.p31d03480} fill="#2563EB" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background12() {
  return (
    <div className="bg-[#eff6ff] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" data-name="Background">
      <Container38 />
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[8px] tracking-[-0.4px] uppercase whitespace-nowrap">
        <p className="leading-[normal]">IMAGE RIGHTS</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative self-stretch shrink-0" data-name="Container">
      <Background12 />
      <Container39 />
    </div>
  );
}

function Data11() {
  return (
    <div className="relative shrink-0 w-[114.88px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-start justify-center relative size-full">
        <Container34 />
        <Container37 />
      </div>
    </div>
  );
}

function Data13() {
  return (
    <div className="h-[18px] relative shrink-0 w-[295.45px]" data-name="Data">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 295.45 18" width="295.45">
        <g id="Data">
          <path d={svgPaths.p38249500} fill="#CBD5E1" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Data12() {
  return (
    <div className="relative shrink-0 w-[295.45px]" data-name="Data">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-end pl-[40px] relative size-full">
        <Data13 />
      </div>
    </div>
  );
}

function RowLucasTorres() {
  return (
    <div className="content-stretch flex gap-[220px] items-center justify-center pt-px relative shrink-0 w-full" data-name="Row - Lucas Torres">
      <div aria-hidden className="absolute border-[#f1f5f9] border-solid border-t inset-0 pointer-events-none" />
      <Data9 />
      <Data10 />
      <Data11 />
      <Data12 />
    </div>
  );
}

function Body() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Body">
      <RowRicardoMendes />
      <RowRicardoMendes1 />
      <RowLucasTorres />
    </div>
  );
}

function Table() {
  return (
    <div className="relative shrink-0 w-full" data-name="Table">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Body />
      </div>
    </div>
  );
}

function ParticipantTableSection() {
  return (
    <div className="bg-white relative rounded-[24px] shrink-0 w-full" data-name="Participant Table Section">
      <div className="content-stretch flex flex-col items-start overflow-clip px-px py-[25px] relative rounded-[inherit] size-full">
        <OverlayHorizontalBorder />
        <Table />
      </div>
      <div aria-hidden className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Background+Shadow">
      <ParticipantTableSection />
    </div>
  );
}

function Background13() {
  return (
    <div className="h-[57px] relative shrink-0 w-[52px]" data-name="Background">
      <svg className="absolute block inset-0 size-full" fill="none" height="57" preserveAspectRatio="none" viewBox="0 0 52 57" width="52">
        <g id="Background">
          <rect fill="white" height="57" rx="12" width="52" />
          <path d={svgPaths.p205f880} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#051d30] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Final Team Validation</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[14px] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Once all members are validated, the team status will</p>
        <p className="leading-[20px]">{`transition to 'Active'.`}</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Heading3 />
      <Container42 />
    </div>
  );
}

function Container40() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-center relative size-full">
        <Background13 />
        <Container41 />
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center pl-[50.36px] pr-[50.38px] py-[17px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden className="absolute border border-[rgba(194,198,210,0.3)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#051d30] text-[14px] text-center tracking-[1.4px] uppercase whitespace-nowrap">
        <p className="leading-[20px] mb-0">CANCEL</p>
        <p className="leading-[20px]">REVIEW</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center pb-[17.5px] pl-[44.28px] pr-[44.3px] pt-[16.5px] relative rounded-[8px] shrink-0" style={{ backgroundImage: "linear-gradient(160.585947230001deg, rgb(0, 53, 106) 0%, rgb(0, 75, 147) 100%)" }} data-name="Button">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[8px] shadow-[0px_20px_25px_-5px_rgba(0,53,106,0.3),0px_8px_10px_-6px_rgba(0,53,106,0.3)]" data-name="Button:shadow" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[1.4px] uppercase whitespace-nowrap">
        <p className="leading-[20px] mb-0">APPROVE FULL</p>
        <p className="leading-[20px]">TEAM</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.99px] items-start relative size-full">
        <Button2 />
        <Button3 />
      </div>
    </div>
  );
}

function BottomActionBarContextual() {
  return (
    <div className="bg-[#cfe5ff] content-stretch flex h-[107px] items-center justify-between pb-[54px] pl-[36px] pr-[32px] pt-[32px] relative rounded-[16px] shrink-0 w-[1522px]" data-name="Bottom Action Bar (Contextual)">
      <div aria-hidden className="absolute border-[#00356a] border-l-4 border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container40 />
      <Container43 />
    </div>
  );
}

function MainContentCanvas() {
  return (
    <div className="h-[1391px] min-h-[1391px] relative shrink-0 w-full" data-name="Main Content Canvas">
      <div className="content-stretch flex flex-col gap-[48px] items-start min-h-[inherit] pt-[96px] px-[32px] relative size-full">
        <HeaderSection />
        <FiltersSearch />
        <BackgroundShadow />
        <BottomActionBarContextual />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#00356a] text-[18px] w-full">
        <p className="leading-[28px]">Senac Robotics</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[12px] tracking-[0.6px] uppercase w-full">
        <p className="leading-[16px]">Regional 2024</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[8px] relative size-full">
        <Heading4 />
        <Container45 />
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[32px] relative size-full">
        <Container44 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[16px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 22 16" width="22">
        <g id="Container">
          <path d={svgPaths.p39955c80} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#00356a] text-[14px] w-[56.78px]">
        <p className="leading-[20px]">Times</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
          <Container46 />
          <Container47 />
        </div>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[18.506px] relative shrink-0 w-[18.032px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="18.5059" preserveAspectRatio="none" viewBox="0 0 18.0318 18.5059" width="18.0318">
        <g id="Container">
          <path d={svgPaths.p26ad4c00} fill="#424751" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[14px] w-[56.78px]">
        <p className="leading-[20px]">partidas</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
          <Container48 />
          <Container49 />
        </div>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="h-[19px] relative shrink-0 w-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="19" preserveAspectRatio="none" viewBox="0 0 18 19" width="18">
        <g id="Container">
          <path d={svgPaths.p19ed9400} fill="#424751" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container51 />
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex flex-col h-[30px] items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[14px] w-[68.25px]">
        <p className="leading-[20px]">Menbros</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container53 />
    </div>
  );
}

function Link2() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
          <Container50 />
          <Container52 />
        </div>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="Container">
          <path d={svgPaths.p30837e80} fill="#424751" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[14px] w-[60.69px]">
        <p className="leading-[20px]">Notas</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
          <Container54 />
          <Container55 />
        </div>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20.1 20" width="20.1">
        <g id="Container">
          <path d={svgPaths.p3cdadd00} fill="#424751" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[14px] w-[53.95px]">
        <p className="leading-[20px]">Settings</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
          <Container56 />
          <Container57 />
        </div>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Nav">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Link />
        <Link1 />
        <Link2 />
        <Link3 />
        <Link4 />
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="11.6667" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667" width="11.6667">
        <g id="Container">
          <path d={svgPaths.p19961e60} fill="#424751" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center px-[16px] py-[8px] relative size-full">
          <Container58 />
          <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[12px] tracking-[1.2px] uppercase w-[65.02px]">
            <p className="leading-[16px]">Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="10.5" preserveAspectRatio="none" viewBox="0 0 10.5 10.5" width="10.5">
        <g id="Container">
          <path d={svgPaths.p28fadc40} fill="#BA1A1A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center px-[16px] py-[8px] relative size-full">
          <Container59 />
          <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#ba1a1a] text-[12px] tracking-[1.2px] uppercase w-[57.64px]">
            <p className="leading-[16px]">Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden className="absolute border-[rgba(194,198,210,0.2)] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start pt-[17px] relative size-full">
        <Link5 />
        <Link6 />
      </div>
    </div>
  );
}

function AsideSideNavigationBarHiddenOnMobile() {
  return (
    <div className="absolute bg-[#edf4ff] content-stretch flex flex-col h-[1391px] items-start justify-between left-0 pb-[16px] pl-[16px] pr-[17px] pt-[80px] top-0 w-[256px]" data-name="Aside - Side Navigation Bar (Hidden on Mobile)">
      <div aria-hidden className="absolute border-[rgba(194,198,210,0.15)] border-r border-solid inset-0 pointer-events-none" />
      <Margin1 />
      <Nav />
      <HorizontalBorder />
    </div>
  );
}

function Container63() {
  return (
    <div className="h-[18.506px] relative shrink-0 w-[18.032px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="18.5059" preserveAspectRatio="none" viewBox="0 0 18.0318 18.5059" width="18.0318">
        <g id="Container">
          <path d={svgPaths.p1154e780} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container63 />
    </div>
  );
}

function Container61() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container62 />
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container61 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[12px] relative shrink-0" data-name="Margin">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] tracking-[0.7px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">Home</p>
      </div>
    </div>
  );
}

function Link7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <Container60 />
          <Margin3 />
        </div>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g id="Container">
          <path d={svgPaths.p22de3980} fill="#475569" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[12px] relative shrink-0" data-name="Margin">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] tracking-[0.7px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">ARENAS</p>
      </div>
    </div>
  );
}

function Link8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <Container64 />
          <Margin4 />
        </div>
      </div>
    </div>
  );
}

function Container65() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="Container">
          <path d={svgPaths.p4c2b800} fill="#1E3A8A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container66() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#00356a] text-[14px] w-[102px]">
        <p className="leading-[20px]">Certificados</p>
      </div>
    </div>
  );
}

function Link9() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
          <Container65 />
          <Container66 />
        </div>
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="h-[16px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 22 16" width="22">
        <g id="Container">
          <path d={svgPaths.p39955c80} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#00356a] text-[14px] w-[45.48px]">
        <p className="leading-[20px]">Times</p>
      </div>
    </div>
  );
}

function Link10() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
          <Container67 />
          <Container68 />
        </div>
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="h-[19px] relative shrink-0 w-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="19" preserveAspectRatio="none" viewBox="0 0 18 19" width="18">
        <g id="Container">
          <path d={svgPaths.p19ed9400} fill="#475569" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[12px] relative shrink-0" data-name="Margin">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] tracking-[0.7px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">RULES</p>
      </div>
    </div>
  );
}

function Link11() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <Container69 />
          <Margin5 />
        </div>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 16 20" width="16">
        <g id="Container">
          <path d={svgPaths.pc679c40} fill="#475569" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[12px] relative shrink-0" data-name="Margin">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] tracking-[0.7px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">DOCUMENTS</p>
      </div>
    </div>
  );
}

function Link12() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <Container70 />
          <Margin6 />
        </div>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="h-[20px] relative shrink-0 w-[17px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 17 20" width="17">
        <g id="Container">
          <path d={svgPaths.p2d9a1e80} fill="#475569" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin7() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[12px] relative shrink-0" data-name="Margin">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] tracking-[0.7px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">SUPPORT</p>
      </div>
    </div>
  );
}

function Link13() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <Container71 />
          <Margin7 />
        </div>
      </div>
    </div>
  );
}

function Nav4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px relative w-full" data-name="Nav">
      <Link9 />
      <Link10 />
      <Link11 />
      <Link12 />
      <Link13 />
    </div>
  );
}

function Nav3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[1209px] items-start relative shrink-0 w-full" data-name="Nav">
      <Link7 />
      <Link8 />
      <Nav4 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Margin">
      <Nav3 />
    </div>
  );
}

function Nav2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px relative w-full" data-name="Nav">
      <Margin2 />
    </div>
  );
}

function Nav1() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Nav">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Nav2 />
      </div>
    </div>
  );
}

function Container72() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="11.6667" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667" width="11.6667">
        <g id="Container">
          <path d={svgPaths.p19961e60} fill="#424751" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link14() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center px-[16px] py-[8px] relative size-full">
          <Container72 />
          <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[12px] tracking-[1.2px] uppercase w-[65.02px]">
            <p className="leading-[16px]">Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="10.5" preserveAspectRatio="none" viewBox="0 0 10.5 10.5" width="10.5">
        <g id="Container">
          <path d={svgPaths.p28fadc40} fill="#BA1A1A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center px-[16px] py-[8px] relative size-full">
          <Container73 />
          <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#ba1a1a] text-[12px] tracking-[1.2px] uppercase w-[57.64px]">
            <p className="leading-[16px]">Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden className="absolute border-[rgba(194,198,210,0.2)] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start pt-[17px] relative size-full">
        <Link14 />
        <Link15 />
      </div>
    </div>
  );
}

function AsideSideNavigationBarHiddenOnMobile1() {
  return (
    <div className="absolute bg-[#edf4ff] content-stretch flex flex-col h-[1391px] items-start justify-between left-0 pb-[16px] pl-[16px] pr-[17px] pt-[80px] top-0 w-[256px]" data-name="Aside - Side Navigation Bar (Hidden on Mobile)">
      <div aria-hidden className="absolute border-[rgba(194,198,210,0.15)] border-r border-solid inset-0 pointer-events-none" />
      <Nav1 />
      <HorizontalBorder1 />
    </div>
  );
}

function Container75() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#00356a] text-[20px] tracking-[2px] uppercase w-[168.73px]">
        <p className="leading-[28px]">ROBOTIC_SYNC</p>
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Container75 />
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Button">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 16 20" width="16">
        <g id="Button">
          <path d={svgPaths.p164b49c0} fill="#424751" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Button">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20.1 20" width="20.1">
        <g id="Button">
          <path d={svgPaths.p3cdadd00} fill="#424751" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container76() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Button4 />
        <Button5 />
      </div>
    </div>
  );
}

function TopNavigationBar() {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(255,255,255,0.7)] content-stretch flex h-[64px] items-center justify-between left-0 pb-px px-[32px] top-0 w-[1818px]" data-name="Top Navigation Bar">
      <div aria-hidden className="absolute border-[rgba(226,232,240,0.15)] border-b border-solid inset-0 pointer-events-none shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container74 />
      <Container76 />
    </div>
  );
}

export default function DashboardDoTecnico() {
  return (
    <div className="bg-[#f7f9ff] content-stretch flex flex-col items-start pl-[256px] relative size-full" data-name="Dashboard do Técnico">
      <MainContentCanvas />
      <AsideSideNavigationBarHiddenOnMobile />
      <AsideSideNavigationBarHiddenOnMobile1 />
      <TopNavigationBar />
    </div>
  );
}