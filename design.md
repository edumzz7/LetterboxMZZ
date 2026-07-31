# CineRats — Guia de Design

Este documento é a referência visual e de interface do CineRats. Qualquer página, componente ou funcionalidade nova deve seguir estas decisões antes de criar estilos próprios. O objetivo é que o produto continue parecendo um único sistema: um clube de cinema pessoal, noturno, sóbrio e premium.

> Fonte técnica atual: React + Tailwind CSS 4. Os tokens semânticos vivem em `src/index.css`, dentro de `@theme`. Prefira as classes `brand-*` a valores hexadecimais novos.

## 1. Identidade visual

**Personalidade:** cinéfila, colecionável e social; mais próxima de uma cinemateca particular do que de um streaming colorido. A interface deve dar protagonismo às capas e aos dados de cada usuário, não competir com eles.

**Direção estética:** modo escuro por padrão, superfícies azul-marinho quase pretas, separadas por linhas discretas. O dourado é o sinal de valor, autoria, progresso e ação — não uma cor de preenchimento recorrente. Espaços generosos, bordas macias e tipografia em caixa alta nos elementos de navegação reforçam a sensação editorial/premium.

**Evite:** gradientes chamativos, vidro excessivo, fundos claros, sombras pesadas em todos os blocos, muitas cores simultâneas, cantos quadrados e botões primários de cores diferentes do dourado.

## 2. Tokens de cor

### Paleta principal

| Papel | Token / valor | Uso |
| --- | --- | --- |
| Fundo da aplicação | `brand-bg` — `#000000` | Canvas da página e fundos absolutamente escuros. |
| Superfície azul-marinho | `brand-card` — `#0A0F1E` | Inputs, cartões secundários e áreas internas. |
| Superfície elevada | `brand-card-light` — `#181D2C` | Estados elevados ou selecionados, com parcimônia. |
| Painel principal | `#06080D` | Containers de conteúdo, header, popovers e barras laterais. |
| Dourado principal | `brand-gold` — `#D4AF37` | CTA primário, item ativo, foco, moedas, ranking e destaque. |
| Dourado secundário | `brand-gold-alt` — `#C5A059` | Metadados de destaque, ícones auxiliares e variação sutil. |
| Texto principal | `brand-text` — `#E0E0E0` | Títulos, valores, conteúdo de leitura. |
| Texto secundário | `brand-text-muted` — `#A0A0A0` | Rótulos, ajuda, placeholders e informações terciárias. |
| Borda estrutural | `#151B28` | Borda padrão de painéis escuros. |
| Borda de campo | `#222222` | Inputs, poster e elementos internos. |
| Divisor suave | `white/5` ou `white/10` | Separação interna sem criar ruído visual. |

### Cores semânticas

Estas cores são exceções com significado; não use como decoração genérica.

| Situação | Tratamento |
| --- | --- |
| Sucesso / sugestão confirmada | Verde esmeralda (`emerald-300` no texto, `emerald-500/10` no fundo e `/20`–`/40` na borda). |
| Erro, remoção ou ação destrutiva | Vermelho (`red-300`/`red-400` no texto, `red-500/10` no fundo e `/20`–`/40` na borda). |
| Nota por estrelas | Amarelo (`yellow-400`); restrito ao sistema de avaliação. |
| Conquista rara | Azul-céu (`sky-400`/`sky-950`). |
| Conquista épica / destaque máximo | Dourado da marca. |
| Conquista secreta | Roxo (`purple-400`/`purple-950`). |
| Conquista comum | Cinza ardósia (`slate-*`). |

**Regra de contraste:** texto normal deve usar `brand-text`; `brand-text-muted` deve ficar reservado a conteúdo secundário e nunca ser a única indicação de estado. Em fundos dourados, use `text-brand-bg`/preto.

## 3. Tipografia

- Família global: `Inter`, depois `Geist`, depois a pilha sans-serif do sistema.
- Renderização: antialiasing está ativo globalmente e deve ser preservado.
- Texto corrente: `text-sm` (14 px) como tamanho padrão; `leading-relaxed` para parágrafos explicativos.
- Metadados: `text-xs` (12 px); microdados apenas quando indispensáveis em `text-[9px]` ou `text-[10px]`.
- Títulos de seção: normalmente `text-sm`/`text-base`, peso `font-medium` ou `font-semibold`.
- Títulos de tela/hero: `text-4xl` a `text-5xl`, `font-light`, caixa alta e tracking moderado.
- Rótulos, abas, filtros e CTAs: caixa alta, `text-[10px]` a `text-xs`, `font-semibold` quando acionáveis e `tracking-[0.12em]` a `tracking-[0.25em]`.

Não aplique caixa alta a textos longos, nomes de filmes, nomes de pessoas ou conteúdo produzido pelo usuário. Evite pesos acima de `font-semibold`: a hierarquia vem mais de escala, cor e espaçamento do que de negrito extremo.

## 4. Espaçamento, dimensão e proporção

Use a escala Tailwind de 4 px como base. Os valores mais recorrentes são:

| Intenção | Valores preferenciais |
| --- | --- |
| Espaço compacto entre ícone e texto | `gap-1.5` / `gap-2` (6 / 8 px) |
| Espaço de itens relacionados | `gap-3` / `gap-4` (12 / 16 px) |
| Espaço entre blocos | `gap-5` / `gap-6` (20 / 24 px) |
| Respiro de seção | `gap-8` ou superior (32 px+) |
| Padding de cartões pequenos | `p-3` a `p-5` (12–20 px) |
| Padding de painel de conteúdo | `p-4` no mobile; `sm:p-7`; `lg:p-9` |
| Altura de ícone-botão | `h-10 w-10` (40 × 40 px) |
| Área mínima de toque | 40 × 40 px sempre que possível |

**Container:** o shell geral usa `max-w-[1700px]`, largura total e `px-3 py-4` no mobile; cresce para `sm:px-6`, `lg:px-8` e `lg:py-6`. Não crie uma página full-width sem justificativa.

**Grade do perfil (desktop XL):** `260px minmax(0, 1fr) 260px`, com `gap-6`. Em resoluções menores, a leitura é linear; não force barras laterais estreitas.

**Mídia:** posters preservam `aspect-[2/3]`, com `object-cover`. Em grade desktop, o catálogo usa 4 colunas no médio, 5 no grande e 6 em telas `2xl`, com `gap-4`, `md:gap-x-6` e `md:gap-y-8`. No mobile, o item vira uma linha horizontal (poster `80 × 128 px`) para privilegiar leitura e toque.

## 5. Bordas, raios e elevação

| Elemento | Raio | Borda | Fundo |
| --- | --- | --- | --- |
| Header e painel principal | `rounded-2xl` a `rounded-3xl` (16–24 px) | `border-[#151b28]` | `#06080D` |
| Cartão lateral | `rounded-3xl` | `border-[#151b28]` | `#06080D` |
| Campo e bloco interno | `rounded-xl` ou `rounded-2xl` | `border-[#222]` | `#090D18` / `brand-card` |
| Poster | `rounded-md` ou `rounded-lg` | `border-[#222]` | `brand-card` |
| Popover / menu | `rounded-xl` | `border-[#222]` | `#0A0F1E` (pode ter `backdrop-blur`) |
| Pill / badge / contador | `rounded-full` | dourado com opacidade | dourado com opacidade baixa |
| Botão de ação principal | `rounded-lg` a `rounded-2xl`, conforme o contexto | sem borda necessária | `brand-gold` |

Sombras são sutis e reservadas a elementos realmente elevados: header, modais, painel de login, perfil e menus. Use preto translúcido; o brilho dourado (`0 0 10–28px rgba(212,175,55,0.15–0.20)`) é exclusivo de itens especiais como avatar, conquistas e CTA em contexto escuro.

## 6. Layout e responsividade

1. Desenvolva mobile primeiro. A interface deve continuar utilizável sem hover e sem depender de uma largura fixa.
2. Em `md`, catálogos podem mudar de lista para grade. Em `xl`, as três colunas do perfil entram em cena.
3. Cabeçalho: primeira linha contém marca, busca e ações; segunda linha contém abas. No mobile, a busca pode ocupar a linha inteira e ocultar temporariamente marca/ações.
4. Preserve `min-w-0` em filhos de flex/grid com conteúdo variável para impedir estouro de títulos e nomes.
5. Para navegação horizontal, use `overflow-x-auto` em vez de reduzir texto até ficar ilegível.
6. Diálogos usam largura fluida (`w-[92vw]`) com `max-w-*` e ficam centralizados; nunca fixe uma largura maior que a viewport.

## 7. Componentes e estados

### Painéis e seções

O painel principal é a unidade estrutural: fundo `#06080D`, borda `#151B28`, raio grande e padding responsivo. Seções internas normalmente usam título em dourado/caixa alta, divisor em `white/10` e conteúdo com contraste mais baixo.

### Botões

- **Primário:** fundo `brand-gold`, texto escuro, label em caixa alta com tracking; hover reduz opacidade ou aplica dourado translúcido no contexto de borda.
- **Secundário:** texto `brand-text` ou dourado, fundo transparente/escuro; hover em `white/5` ou `brand-gold/10`.
- **Ícone:** quadrado de 40 px, borda dourada ou estrutural, raio `xl`; usar ícones Lucide em 14–18 px.
- **Destrutivo:** texto e hover vermelho; não transforme um CTA primário dourado em vermelho sem o contexto explícito de exclusão.
- Estados `disabled` reduzem opacidade e removem interação (`pointer-events-none` ou `disabled:*`). Estados pendentes exibem `Loader2` sem deslocar excessivamente o layout.

### Inputs e formulários

- Campo: `bg-[#090d18]` ou `brand-card`, borda `#222`, raio 16 px/`rounded-2xl`, `px-4 py-3`.
- Foco: `focus:border-brand-gold` ou `focus:ring-brand-gold`; nunca deixe o foco invisível.
- Rótulo: `text-xs`, caixa alta, `tracking-[0.25em]`, cor atenuada.
- Erro: bloco com borda e fundo vermelhos translúcidos; escreva uma mensagem objetiva.
- O autofill deve manter a aparência escura definida em `src/index.css`.

### Menus, popovers e modais

- Overlay de modal: `bg-black/80` com `backdrop-blur-sm`.
- Conteúdo: fundo azul-marinho escuro, borda discreta (dourada apenas como acento), raio `rounded-2xl`, sombra profunda.
- Itens de menu usam `text-xs`, `rounded-md`, padding compacto e destaque dourado translúcido no hover/focus.
- O botão de fechar é discreto, circular e muda para dourado no hover.

### Cartões de mídia

O poster é o protagonista. Na interação, use escala lenta e pequena (`group-hover:scale-105`, `duration-500`), borda dourada secundária e brilho leve. O título usa uma linha truncada na lista; metadados ficam abaixo e em tom atenuado. Menus contextuais ficam sobre o poster, com fundo escuro e blur para preservar legibilidade.

### Feedback, carregamento e vazio

- Carregamento: `Loader2` dourado, geralmente centralizado em uma área com `py-20`.
- Sucesso: verde sem abandonar o tema escuro.
- Erro: vermelho translúcido e linguagem direta; evite alarmismo.
- Estado vazio: mensagem curta, centralizada, `text-brand-text-muted`, sem ilustrações concorrendo com o conteúdo.

## 8. Interação e movimento

- Transições usuais: `transition`/`transition-colors` ou `transition-all` com duração breve; posters podem usar `duration-500`.
- Entradas de conteúdo: `fade-in` suave (`duration-200`–`500`).
- Pressão de CTA: `active:scale-95` pode ser usada em ações principais dentro de modais.
- Badges de conquista podem ter brilho e animação curta; os hover effects específicos já estão em `src/index.css`.
- Toda informação exposta somente por hover deve permanecer acessível por toque, foco ou texto alternativo.

## 9. Ícones, imagens e acessibilidade

- Use `lucide-react` para ações de interface, normalmente em 14–18 px. Não misture famílias de ícones sem necessidade.
- Ícones acionáveis precisam de `aria-label` e `title` quando não há texto visível.
- Imagens de poster devem ter `alt` com o título; para falhas, mantenha o fallback escuro com ícone de filme e nome.
- Imagens devem usar `object-cover`; avatares são circulares, com borda contextual.
- Mantenha contraste, foco visível, labels associados aos campos e alvos de toque adequados. Cor nunca deve ser a única forma de comunicar erro, sucesso ou seleção.

## 10. Receita para novas telas

1. Comece com `min-h-screen bg-brand-bg text-brand-text` e use o shell existente quando a tela pertencer à área autenticada.
2. Envolva o conteúdo em um painel padrão (`rounded-3xl border border-[#151b28] bg-[#06080d]`) e aplique o padding responsivo do sistema.
3. Defina hierarquia: título/ação principal, metadados atenuados, separadores discretos e cards internos somente quando agrupamento for necessário.
4. Use dourado para a ação ou estado mais importante da área, não para todos os controles.
5. Implemente primeiro a versão móvel, depois grade/colunas nos breakpoints já usados pelo projeto.
6. Inclua estados de carregamento, vazio, erro, hover, foco, pendência e desabilitado desde a primeira implementação.
7. Antes de finalizar, confira se nenhuma cor, raio, sombra ou padrão novo foi criado sem necessidade.

## 11. Consistência de implementação

- Prefira tokens semânticos como `bg-brand-bg`, `text-brand-gold` e `text-brand-text-muted`.
- Valores hexadecimais existentes (`#06080D`, `#151B28`, `#222`) representam superfícies estruturais já consolidadas. Reuse-os quando o token ainda não existir; não introduza quase-duplicatas.
- Não reutilize estilos legados de `src/App.css` como base de componentes novos: esse arquivo contém resíduos do template inicial do Vite. As decisões ativas estão em `src/index.css` e nas classes dos componentes.
- Ao notar um padrão repetido em três ou mais lugares, considere promover o valor a token/utilitário antes de espalhar novas classes arbitrárias.
- Este documento descreve o sistema atual. Ao alterar deliberadamente a identidade visual, atualize este arquivo na mesma mudança.
