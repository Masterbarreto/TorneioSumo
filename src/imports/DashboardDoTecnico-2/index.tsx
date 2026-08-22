import svgPaths from "./svg-lncjpuzj7f";
import imgCyberBotsLogo from "./c59b0854417cc2b0f31b4d09ac8d4857a88ed716.png";
import imgTechKnightsLogo from "./e18b7015cb02a1e04d542279e6514f25357d4adf.png";
import imgMechEngLogo from "./5d16b98e05035db093ea19ea95851a20eb1accdb.png";

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#8c4f00] text-[12px] tracking-[2.4px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">ADMINISTRAÇÃO TÉCNICA</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#051d30] text-[36px] tracking-[-0.9px] whitespace-nowrap">
        <p className="leading-[40px]">Análise de Inscrições</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0" data-name="Container">
      <Container2 />
      <Heading />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#00356a] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Status Global:</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#ffdcbf] mr-[-0.01px] relative rounded-[2px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col items-start px-[8px] py-[2px] relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2d1600] text-[10px] tracking-[0.5px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">12 PENDENTES</p>
        </div>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#cfe5ff] flex-[1_0_0] min-h-px relative rounded-[2px]" data-name="Background">
      <div className="content-stretch flex flex-col items-start px-[8px] py-[2px] relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#051d30] text-[10px] tracking-[0.5px] uppercase whitespace-nowrap">
          <p className="leading-[15px]">45 APROVADOS</p>
        </div>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pl-[8px] relative self-stretch shrink-0" data-name="Margin">
      <Background2 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <Background1 />
      <Margin1 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[12px] relative shrink-0" data-name="Margin">
      <Container5 />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e3efff] relative rounded-[8px] self-stretch shrink-0" data-name="Background">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] py-[8px] relative size-full">
          <Container4 />
          <Margin />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <Background />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container3 />
    </div>
  );
}

function PageHeader() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Page Header">
      <Container />
    </div>
  );
}

function Margin2() {
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

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] w-full">
        <p className="leading-[normal]">Buscar por nome da equipe, mentor ou ID...</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pb-[10px] pt-[9px] px-[12px] relative size-full">
          <Container7 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[24px] relative size-full">
          <Margin2 />
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

function Background3() {
  return (
    <div className="bg-[#edf4ff] col-[1/span_8] h-[44px] justify-self-stretch relative rounded-[12px] row-1 shrink-0" data-name="Background">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[4px] relative size-full">
          <Container6 />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[21px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="21" preserveAspectRatio="none" viewBox="0 0 21 21" width="21">
        <g id="SVG">
          <path d="M6.3 8.4L10.5 12.6L14.7 8.4" id="Vector" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.575" />
        </g>
      </svg>
    </div>
  );
}

function ImageClip() {
  return (
    <div className="absolute content-stretch flex flex-col inset-[0_0.33px_0_0] items-start justify-center overflow-clip pl-[275px] pr-[8px] py-[11.5px]" data-name="image clip">
      <Svg />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#051d30] text-[14px] w-full">
        <p className="leading-[20px]">Todas as Categorias</p>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div className="bg-[#edf4ff] flex-[1_0_0] h-full min-w-px relative rounded-[12px]" data-name="Options">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[24px] py-[8px] relative size-full">
          <ImageClip />
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="col-[9/span_4] content-stretch flex h-[44px] items-start justify-center justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Options />
    </div>
  );
}

function FiltersSearch() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_44px] relative shrink-0 w-full" data-name="Filters & Search">
      <Background3 />
      <Container8 />
    </div>
  );
}

function CyberBotsLogo() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="CyberBots Logo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-1.11%] max-w-none top-0 w-[102.23%]" src={imgCyberBotsLogo} />
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#d9eaff] content-stretch flex h-[56px] items-center justify-center overflow-clip relative rounded-[8px] shrink-0 w-[54.78px]" data-name="Background">
      <CyberBotsLogo />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal items-start leading-[0] not-italic pr-[48.45px] relative shrink-0 whitespace-nowrap" data-name="Paragraph">
      <div className="flex flex-col justify-center relative shrink-0 text-[#051d30] text-[18px] tracking-[-0.45px]">
        <p className="leading-[28px] mb-0">CyberBots</p>
        <p className="leading-[28px]">Alpha</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#424751] text-[10px] uppercase">
        <p className="leading-[15px]">ID: #RA-2024-089</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[16px] relative shrink-0" data-name="Margin">
      <Paragraph />
    </div>
  );
}

function Container11() {
  return (
    <div className="col-[1/span_3] content-stretch flex h-[71px] items-center justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <Background4 />
      <Margin3 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#727782] text-[10px] uppercase w-full">
        <p className="leading-[15px]">MEMBROS</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-8px] relative shrink-0 size-[32px]" data-name="Margin">
      <div className="bg-[#cbd5e1] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-8px] relative shrink-0 size-[32px]" data-name="Margin">
      <div className="bg-[#94a3b8] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#004b93] content-stretch flex items-center justify-center pb-[9px] pt-[8px] px-[2px] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
      <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">+2</p>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[32px]" data-name="Margin">
      <BackgroundBorder />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <div className="bg-[#e2e8f0] mr-[-8px] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      </div>
      <Margin4 />
      <Margin5 />
      <Margin6 />
    </div>
  );
}

function Container12() {
  return (
    <div className="col-[4/span_2] content-stretch flex flex-col gap-[4px] items-start justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#727782] text-[10px] uppercase w-full">
        <p className="leading-[15px]">DOCUMENTAÇÃO (PDF)</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="11.6667" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667" width="11.6667">
        <g id="Container">
          <path d={svgPaths.p110ee600} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#004b93] text-[10px] text-center uppercase whitespace-nowrap">
        <p className="leading-[15px]">IDENTIDADE</p>
      </div>
    </div>
  );
}

function Margin7() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <Container19 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#e3efff] content-stretch flex items-center px-[12px] py-[11px] relative rounded-[4px] shrink-0" data-name="Button">
      <Container18 />
      <Margin7 />
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[10.5px] mr-[-0.01px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="10.5" preserveAspectRatio="none" viewBox="0 0 11.6667 10.5" width="11.6667">
        <g id="Container">
          <path d={svgPaths.p3957770} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-center pl-[3.55px] pr-[3.56px] relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#004b93] text-[10px] text-center uppercase whitespace-nowrap">
        <p className="leading-[15px] mb-0">DIREITO</p>
        <p className="leading-[15px]">IMAGEM</p>
      </div>
    </div>
  );
}

function Margin8() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <Container21 />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#e3efff] content-stretch flex items-center px-[12px] py-[6px] relative rounded-[4px] shrink-0" data-name="Button">
      <Container20 />
      <Margin8 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Button:margin">
      <Button2 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <ButtonMargin />
    </div>
  );
}

function Container15() {
  return (
    <div className="col-[6/span_3] content-stretch flex flex-col gap-[4px] items-start justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#727782] text-[10px] uppercase w-full">
        <p className="leading-[15px]">STATUS</p>
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#ffdcbf] content-stretch flex gap-[8px] items-center px-[12px] py-[4px] relative rounded-[12px] shrink-0" data-name="Background">
      <div className="bg-[#8c4f00] relative rounded-[12px] shrink-0 size-[6px]" data-name="Background" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2d1600] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">PENDENTE</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="col-[9/span_2] content-stretch flex flex-col gap-[8px] items-start justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <Container23 />
      <Background5 />
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[15px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="15" preserveAspectRatio="none" viewBox="0 0 22 15" width="22">
        <g id="Container">
          <path d={svgPaths.p3e801e80} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#e3efff] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]" data-name="Button">
      <Container25 />
    </div>
  );
}

function Container24() {
  return (
    <div className="col-12 content-stretch flex h-[40px] items-start justify-end justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <Button3 />
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_71px] p-[24px] relative size-full">
        <Container11 />
        <Container12 />
        <Container15 />
        <Container22 />
        <Container24 />
      </div>
    </div>
  );
}

function TeamCard() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Team Card 1">
      <Container10 />
    </div>
  );
}

function TechKnightsLogo() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="TechKnights Logo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgTechKnightsLogo} />
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#d9eaff] content-stretch flex items-center justify-center overflow-clip relative rounded-[8px] shrink-0 size-[56px]" data-name="Background">
      <TechKnightsLogo />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal items-start leading-[0] not-italic relative shrink-0 whitespace-nowrap" data-name="Paragraph">
      <div className="flex flex-col justify-center mb-[-0.5px] relative shrink-0 text-[#051d30] text-[18px] tracking-[-0.45px]">
        <p className="leading-[28px]">TechKnights BR</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#424751] text-[10px] uppercase">
        <p className="leading-[15px]">ID: #RA-2024-102</p>
      </div>
    </div>
  );
}

function Margin9() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[16px] relative shrink-0" data-name="Margin">
      <Paragraph1 />
    </div>
  );
}

function Container26() {
  return (
    <div className="col-[1/span_3] h-[56px] justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Background6 />
        <Margin9 />
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#727782] text-[10px] uppercase w-full">
        <p className="leading-[15px]">MEMBROS</p>
      </div>
    </div>
  );
}

function Margin10() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-8px] relative shrink-0 size-[32px]" data-name="Margin">
      <div className="bg-[#94a3b8] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-[#004b93] content-stretch flex items-center justify-center pb-[9px] pt-[8px] px-[2px] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
      <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">+1</p>
      </div>
    </div>
  );
}

function Margin11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[32px]" data-name="Margin">
      <BackgroundBorder1 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <div className="bg-[#cbd5e1] mr-[-8px] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      </div>
      <Margin10 />
      <Margin11 />
    </div>
  );
}

function Container27() {
  return (
    <div className="col-[4/span_2] justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container28 />
        <Container29 />
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#727782] text-[10px] uppercase w-full">
        <p className="leading-[15px]">DOCUMENTAÇÃO (PDF)</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="mr-[-0.01px] relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="11.6667" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667" width="11.6667">
        <g id="Container">
          <path d={svgPaths.p308a4a00} fill="#93000A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#93000a] text-[10px] text-center uppercase whitespace-nowrap">
        <p className="leading-[15px]">CORRIGIR</p>
      </div>
    </div>
  );
}

function Margin12() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <Container34 />
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#ffdad6] content-stretch flex items-center px-[12px] py-[11px] relative rounded-[4px] shrink-0" data-name="Button">
      <Container33 />
      <Margin12 />
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="10.5" preserveAspectRatio="none" viewBox="0 0 11.6667 10.5" width="11.6667">
        <g id="Container">
          <path d={svgPaths.p3957770} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-center pl-[9.47px] pr-[9.49px] relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#004b93] text-[10px] text-center uppercase whitespace-nowrap">
        <p className="leading-[15px] mb-0">DIREITO</p>
        <p className="leading-[15px]">IMAGEM</p>
      </div>
    </div>
  );
}

function Margin13() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <Container36 />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#e3efff] content-stretch flex items-center px-[12px] py-[6px] relative rounded-[4px] shrink-0" data-name="Button">
      <Container35 />
      <Margin13 />
    </div>
  );
}

function ButtonMargin1() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Button:margin">
      <Button5 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Button4 />
      <ButtonMargin1 />
    </div>
  );
}

function Container30() {
  return (
    <div className="col-[6/span_3] justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container31 />
        <Container32 />
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#727782] text-[10px] uppercase w-full">
        <p className="leading-[15px]">STATUS</p>
      </div>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#ffdad6] content-stretch flex items-center pl-[12px] pr-[44.66px] py-[4px] relative rounded-[12px] shrink-0" data-name="Background">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#93000a] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[15px] mb-0">AJUSTE</p>
        <p className="leading-[15px]">NECESSÁRIO</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="col-[9/span_2] justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Container38 />
        <Background7 />
      </div>
    </div>
  );
}

function Container39() {
  return <div className="col-[1/span_2] h-[40px] justify-self-stretch relative row-2 self-center shrink-0" data-name="Container" />;
}

function Container41() {
  return (
    <div className="h-[15px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="15" preserveAspectRatio="none" viewBox="0 0 22 15" width="22">
        <g id="Container">
          <path d={svgPaths.p3e801e80} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#e3efff] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]" data-name="Button">
      <Container41 />
    </div>
  );
}

function Container40() {
  return (
    <div className="col-[11/span_2] h-[40px] justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-end relative size-full">
        <Button6 />
      </div>
    </div>
  );
}

function VerticalBorder() {
  return (
    <div className="h-[122px] relative shrink-0 w-full" data-name="VerticalBorder">
      <div aria-hidden className="absolute border-[#ba1a1a] border-l-4 border-solid inset-0 pointer-events-none" />
      <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[__61px_fit-content(100%)] pl-[28px] pr-[24px] py-[24px] relative size-full">
        <Container26 />
        <Container27 />
        <Container30 />
        <Container37 />
        <Container39 />
        <Container40 />
      </div>
    </div>
  );
}

function TeamCard2NeedsCorrection() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Team Card 2 (Needs Correction)">
      <VerticalBorder />
    </div>
  );
}

function MechEngLogo() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="MechEng Logo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-11.57%] max-w-none top-0 w-[123.13%]" src={imgMechEngLogo} />
      </div>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#d9eaff] content-stretch flex h-[56px] items-center justify-center overflow-clip relative rounded-[8px] shrink-0 w-[45.48px]" data-name="Background">
      <MechEngLogo />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal items-start leading-[0] not-italic pr-[49.16px] relative shrink-0 whitespace-nowrap" data-name="Paragraph">
      <div className="flex flex-col justify-center relative shrink-0 text-[#051d30] text-[18px] tracking-[-0.45px]">
        <p className="leading-[28px] mb-0">MechEng</p>
        <p className="leading-[28px]">Sustentável</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#424751] text-[10px] uppercase">
        <p className="leading-[15px]">ID: #RA-2024-045</p>
      </div>
    </div>
  );
}

function Margin14() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[16px] relative shrink-0" data-name="Margin">
      <Paragraph2 />
    </div>
  );
}

function Container43() {
  return (
    <div className="col-[1/span_3] content-stretch flex h-[71px] items-center justify-self-stretch opacity-70 relative row-1 self-center shrink-0" data-name="Container">
      <Background8 />
      <Margin14 />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#727782] text-[10px] uppercase w-full">
        <p className="leading-[15px]">MEMBROS</p>
      </div>
    </div>
  );
}

function Margin15() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-8px] relative shrink-0 size-[32px]" data-name="Margin">
      <div className="bg-[#cbd5e1] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      </div>
    </div>
  );
}

function Margin16() {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-8px] relative shrink-0 size-[32px]" data-name="Margin">
      <div className="bg-[#94a3b8] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      </div>
    </div>
  );
}

function Margin17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[32px]" data-name="Margin">
      <div className="bg-[#64748b] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <div className="bg-[#e2e8f0] mr-[-8px] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background+Border">
        <div aria-hidden className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      </div>
      <Margin15 />
      <Margin16 />
      <Margin17 />
    </div>
  );
}

function Container44() {
  return (
    <div className="col-[4/span_2] content-stretch flex flex-col gap-[4px] items-start justify-self-stretch opacity-70 relative row-1 self-center shrink-0" data-name="Container">
      <Container45 />
      <Container46 />
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#727782] text-[10px] uppercase w-full">
        <p className="leading-[15px]">DOCUMENTAÇÃO</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="relative shrink-0 size-[20px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
          <path d={svgPaths.p1caa9380} fill="#00356A" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Margin18() {
  return (
    <div className="content-stretch flex flex-col items-center pl-[8px] relative shrink-0" data-name="Margin">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[10px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">VERIFICADO</p>
      </div>
    </div>
  );
}

function MarginAlignCenter() {
  return (
    <div className="content-stretch flex items-center relative self-stretch shrink-0" data-name="Margin:align-center">
      <Margin18 />
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Container50 />
      <MarginAlignCenter />
    </div>
  );
}

function Container47() {
  return (
    <div className="col-[6/span_3] content-stretch flex flex-col gap-[4px] items-start justify-self-stretch opacity-70 relative row-1 self-center shrink-0" data-name="Container">
      <Container48 />
      <Container49 />
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#727782] text-[10px] uppercase w-full">
        <p className="leading-[15px]">STATUS</p>
      </div>
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-[#cfe5ff] content-stretch flex items-center px-[12px] py-[4px] relative rounded-[12px] shrink-0" data-name="Background">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#051d30] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">APROVADO</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="col-[9/span_2] content-stretch flex flex-col gap-[8px] items-start justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <Container52 />
      <Background9 />
    </div>
  );
}

function Container54() {
  return (
    <div className="h-[15px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="15" preserveAspectRatio="none" viewBox="0 0 22 15" width="22">
        <g id="Container">
          <path d={svgPaths.p3e801e80} fill="#00356A" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[#e3efff] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]" data-name="Button">
      <Container54 />
    </div>
  );
}

function Container53() {
  return (
    <div className="col-[11/span_2] content-stretch flex h-[40px] items-start justify-end justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <Button7 />
    </div>
  );
}

function Container42() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[_71px] p-[24px] relative size-full">
        <Container43 />
        <Container44 />
        <Container47 />
        <Container51 />
        <Container53 />
      </div>
    </div>
  );
}

function TeamCard3Approved() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Team Card 3 (Approved)">
      <Container42 />
    </div>
  );
}

function TeamsBentoGridList() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Teams Bento Grid / List">
      <TeamCard />
      <TeamCard2NeedsCorrection />
      <TeamCard3Approved />
    </div>
  );
}

function MainContentCanvas() {
  return (
    <div className="min-h-[1391px] relative shrink-0 w-full" data-name="Main Content Canvas">
      <div className="content-stretch flex flex-col gap-[48px] items-start min-h-[inherit] pt-[96px] px-[32px] relative size-full">
        <PageHeader />
        <FiltersSearch />
        <TeamsBentoGridList />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#00356a] text-[18px] w-full">
        <p className="leading-[28px]">Senac Robotics</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[12px] tracking-[0.6px] uppercase w-full">
        <p className="leading-[16px]">Regional 2024</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[8px] relative size-full">
        <Heading1 />
        <Container56 />
      </div>
    </div>
  );
}

function Margin19() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[32px] relative size-full">
        <Container55 />
      </div>
    </div>
  );
}

function Container57() {
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

function Container58() {
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
          <Container57 />
          <Container58 />
        </div>
      </div>
    </div>
  );
}

function Container59() {
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

function Container60() {
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
          <Container59 />
          <Container60 />
        </div>
      </div>
    </div>
  );
}

function Container62() {
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

function Container61() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container62 />
    </div>
  );
}

function Container64() {
  return (
    <div className="content-stretch flex flex-col h-[30px] items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[14px] w-[68.25px]">
        <p className="leading-[20px]">Menbros</p>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container64 />
    </div>
  );
}

function Link2() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative size-full">
          <Container61 />
          <Container63 />
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
          <path d={svgPaths.p30837e80} fill="#424751" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container66() {
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
          <Container65 />
          <Container66 />
        </div>
      </div>
    </div>
  );
}

function Container67() {
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

function Container68() {
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
          <Container67 />
          <Container68 />
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

function Container69() {
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
          <Container69 />
          <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[12px] tracking-[1.2px] uppercase w-[65.02px]">
            <p className="leading-[16px]">Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container70() {
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
          <Container70 />
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
      <Margin19 />
      <Nav />
      <HorizontalBorder />
    </div>
  );
}

function Container74() {
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

function Container73() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container74 />
    </div>
  );
}

function Container72() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container73 />
    </div>
  );
}

function Container71() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container72 />
    </div>
  );
}

function Margin21() {
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
          <Container71 />
          <Margin21 />
        </div>
      </div>
    </div>
  );
}

function Container75() {
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

function Margin22() {
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
          <Container75 />
          <Margin22 />
        </div>
      </div>
    </div>
  );
}

function Container76() {
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

function Container77() {
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
          <Container76 />
          <Container77 />
        </div>
      </div>
    </div>
  );
}

function Container78() {
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

function Container79() {
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
          <Container78 />
          <Container79 />
        </div>
      </div>
    </div>
  );
}

function Container80() {
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

function Margin23() {
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
          <Container80 />
          <Margin23 />
        </div>
      </div>
    </div>
  );
}

function Container81() {
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

function Margin24() {
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
          <Container81 />
          <Margin24 />
        </div>
      </div>
    </div>
  );
}

function Container82() {
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

function Margin25() {
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
          <Container82 />
          <Margin25 />
        </div>
      </div>
    </div>
  );
}

function Nav3() {
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

function Nav2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[1209px] items-start relative shrink-0 w-full" data-name="Nav">
      <Link7 />
      <Link8 />
      <Nav3 />
    </div>
  );
}

function Margin20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Margin">
      <Nav2 />
    </div>
  );
}

function Nav1() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Nav">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Margin20 />
      </div>
    </div>
  );
}

function Container83() {
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
          <Container83 />
          <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#424751] text-[12px] tracking-[1.2px] uppercase w-[65.02px]">
            <p className="leading-[16px]">Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container84() {
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
          <Container84 />
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

function Container86() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#00356a] text-[20px] tracking-[2px] uppercase w-[168.73px]">
        <p className="leading-[28px]">ROBOTIC_SYNC</p>
      </div>
    </div>
  );
}

function Container85() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Container86 />
      </div>
    </div>
  );
}

function Button8() {
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

function Button9() {
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

function Container87() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Button8 />
        <Button9 />
      </div>
    </div>
  );
}

function TopNavigationBar() {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(255,255,255,0.7)] content-stretch flex h-[64px] items-center justify-between left-0 pb-px px-[32px] top-0 w-[1818px]" data-name="Top Navigation Bar">
      <div aria-hidden className="absolute border-[rgba(226,232,240,0.15)] border-b border-solid inset-0 pointer-events-none shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container85 />
      <Container87 />
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