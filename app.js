// Conjecture 0.5 / Corollary 1.5 visualization
// Ported from frontend/src/hidden_page.tsx (React) to vanilla JS.
// All Tailwind class strings are kept verbatim so the Tailwind CLI content
// scanner picks them up when building ./dist/tailwind.css.

(function () {
  'use strict';

  // ---------- state ----------

  const state = {
    n: 4,
    m: 0,
    k: 2,
    j: 1,
    magicResults: null,
    isMagicDialogOpen: false,
  };

  function setN(value) {
    state.n = Number.isNaN(value) ? 0 : Math.max(0, value);
    // Mirrors the original useEffect: clear magic results when n or m change.
    state.magicResults = null;
    render();
  }

  function setM(value) {
    state.m = Number.isNaN(value) ? 0 : value;
    state.magicResults = null;
    render();
  }

  function setK(value) {
    state.k = Number.isNaN(value) ? 0 : Math.max(0, value);
    render();
  }

  function setJ(value) {
    state.j = Number.isNaN(value) ? 0 : Math.max(0, value);
    render();
  }

  function setKJ(k, j) {
    state.k = k;
    state.j = j;
  }

  // ---------- derivations (ported from hidden_page.tsx) ----------

  function computeCorollaryResults(n, m) {
    const results = [];
    for (let i = 0; i <= 2 * n; i++) {
      let vanishing = [];
      let weightBound = null;
      let minWeight = null;

      const case1 = i <= n;
      const case2 = n <= i;

      if (case1 && case2) {
        vanishing.push(
          `H^{p,j-p}\\, \\operatorname{gr}^W_j H^{${i}}(X,\\mathbf{Q}) = 0 \\quad (p \\le ${m}, j \\le ${i - 1})`
        );
        minWeight = Math.min(2 * m + 2, i);
        weightBound = `\\ge \\min\\{${2 * m + 2}, ${i}\\} = ${minWeight}`;
      } else if (case1) {
        vanishing.push(
          `H^{p,j-p}\\, \\operatorname{gr}^W_j H^{${i}}(X,\\mathbf{Q}) = 0 \\quad (p \\le ${m}, j \\le ${i - 1})`
        );
        minWeight = Math.min(2 * m + 2, i);
        weightBound = `\\ge \\min\\{${2 * m + 2}, ${i}\\} = ${minWeight}`;
      } else if (case2) {
        const pMax = i - n + m;
        vanishing.push(
          `H^{p,j-p}\\, \\operatorname{gr}^W_j H^{${i}}(X,\\mathbf{Q}) = 0 \\quad (p \\le ${pMax}, j \\le ${i - 1})`
        );
        minWeight = Math.min(2 * i - 2 * n + 2 * m + 2, i);
        weightBound = `\\ge \\min\\{${2 * i - 2 * n + 2 * m + 2}, ${i}\\} = ${minWeight}`;
      }

      if (vanishing.length > 0) {
        results.push({ i, vanishing, weightBound, minWeight });
      }
    }
    return results;
  }

  function computeCoarseConditions(k, j, corollaryResults) {
    const conditions = [];
    for (let b = 0; b <= k; b++) {
      const weight = b - k + 2 * j;
      if (weight >= 0) {
        const corRes = corollaryResults.find((r) => r.i === b);
        const isMet = !!(corRes && corRes.minWeight - 1 >= weight);
        conditions.push({
          b,
          weight,
          text: `W_{${weight}} H^{${b}}(X, \\mathbf{Q}) = 0`,
          isMet,
        });
      }
    }
    return conditions;
  }

  function computePreciseConditions(k, j, n, m) {
    const conditions = [];
    for (let b = 0; b <= k; b++) {
      const maxW = Math.min(b, b - k + 2 * j);
      for (let w = 0; w <= maxW; w++) {
        const maxS = Math.min(w, b + j - k);
        for (let s = 0; s <= maxS; s++) {
          const r = w - s;
          const c = b - w;

          let isMet = false;
          let metReason = null;
          if (w <= b - 1) {
            const case1 = b <= n;
            const case2 = n <= b;

            let pMax = -1;
            if (case1) pMax = m;
            else if (case2) pMax = b - n + m;

            if (pMax >= 0) {
              if (r <= pMax) {
                isMet = true;
                metReason = 'Met by Cor 1.5';
              } else if (s <= pMax) {
                isMet = true;
                metReason = 'Met by Cor 1.5 (Hodge Symmetry)';
              }
            }
          }

          conditions.push({
            b,
            c,
            w,
            r,
            s,
            text: `H^{${r},${s}}\\, \\operatorname{gr}^W_{${w}} H^{${b}}(X, \\mathbf{Q}) = 0`,
            isMet,
            metReason,
          });
        }
      }
    }
    return conditions;
  }

  function computeConjectureDiagramRows(k, j, n, m) {
    const maxP = Math.max(k, 0);
    const maxQ = Math.max(k, 2 * j, 0);
    const rows = [];

    for (let q_val = maxQ; q_val >= 0; q_val--) {
      const cells = [];
      for (let p_val = 0; p_val <= maxP; p_val++) {
        const b_val = p_val + q_val;
        const weightBound = b_val - k + 2 * j;
        const isInRange = b_val <= k;
        const isZero = isInRange && q_val <= weightBound;

        let corollaryPMax = null;
        if (q_val <= b_val - 1) {
          const pMax = b_val <= n ? m : b_val - n + m;
          if (pMax >= 0) {
            corollaryPMax = pMax;
          }
        }

        cells.push({
          p: p_val,
          q: q_val,
          b: b_val,
          isInRange,
          isZero,
          corollaryPMax,
        });
      }
      rows.push({ q: q_val, cells });
    }

    return rows;
  }

  function computeMagicGridRows(n, magicResultSet) {
    const rows = [];
    for (let q_val = 0; q_val >= -n; q_val--) {
      const cells = [];
      for (let p_val = 0; p_val <= n; p_val++) {
        const k_val = p_val - q_val;
        const j_val = -q_val;
        cells.push({
          p: p_val,
          q: q_val,
          k: k_val,
          j: j_val,
          isZero: magicResultSet.has(`${k_val}:${j_val}`),
        });
      }
      rows.push({ q: q_val, cells });
    }
    return rows;
  }

  function computeMagicResults(n, m) {
    const validPairs = [];
    for (let j_val = 0; j_val <= n; j_val++) {
      for (let p_val = 0; p_val <= n; p_val++) {
        const k_val = p_val + j_val;
        let allMet = true;

        for (let b = 0; b <= k_val; b++) {
          const maxW = Math.min(b, b - k_val + 2 * j_val);
          for (let w = 0; w <= maxW; w++) {
            const maxS = Math.min(w, b + j_val - k_val);
            for (let s = 0; s <= maxS; s++) {
              const r = w - s;

              let isMet = false;
              if (w <= b - 1) {
                const case1 = b <= n;
                const case2 = n <= b;

                let pMax = -1;
                if (case1) pMax = m;
                else if (case2) pMax = b - n + m;

                if (pMax >= 0) {
                  if (r <= pMax || s <= pMax) {
                    isMet = true;
                  }
                }
              }
              if (!isMet) {
                allMet = false;
                break;
              }
            }
            if (!allMet) break;
          }
          if (!allMet) break;
        }

        if (allMet) {
          validPairs.push({ k: k_val, j: j_val });
        }
      }
    }
    return validPairs;
  }

  // ---------- helpers ----------

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function mathSpan(tex, display) {
    const mode = display === 'block' ? 'block' : 'inline';
    return `<span data-math="${escapeAttr(tex)}" data-display="${mode}"></span>`;
  }

  function renderMath(root) {
    if (typeof window.katex === 'undefined') return;
    const nodes = root.querySelectorAll('[data-math]');
    nodes.forEach((node) => {
      const tex = node.getAttribute('data-math');
      const displayMode = node.getAttribute('data-display') === 'block';
      try {
        window.katex.render(tex, node, {
          throwOnError: false,
          displayMode,
        });
      } catch (err) {
        node.textContent = tex;
      }
    });
  }

  // ---------- templates ----------

  function templateNmWarning(n, m) {
    if (2 * m + 2 <= n) return '';
    return `
      <div class="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4">
        <p class="text-sm text-amber-700">
          <strong>Warning:</strong> The condition ${mathSpan('2m+2 \\le n', 'inline')} is not satisfied (${mathSpan(
      `${2 * m + 2} \\not\\le ${n}`,
      'inline'
    )}). The corollary may not apply.
        </p>
      </div>
    `;
  }

  function templateMagicDialog(n, magicResults, magicGridRows) {
    if (!state.isMagicDialogOpen) return '';

    const headerHtml = `
      <div class="flex items-start justify-between gap-4 mb-4">
        <h3 class="text-base font-semibold text-neutral-900">
          Vanishing ${mathSpan('H^k_{cdh}(X, \\mathbf{Q}(j)) = 0', 'inline')} for:
        </h3>
        <button
          type="button"
          data-action="close-magic-dialog"
          class="text-neutral-500 hover:text-neutral-700 text-sm"
          aria-label="Close dialog"
        >
          Close
        </button>
      </div>
    `;

    let bodyHtml;
    if (magicResults) {
      const thCells = Array.from({ length: n + 1 }, (_, p_val) =>
        `<th class="px-3 py-2 text-xs font-semibold text-neutral-600 border border-neutral-200">${mathSpan(
          `p=${p_val}`,
          'inline'
        )}</th>`
      ).join('');

      const rowsHtml = magicGridRows
        .map((row) => {
          const cellsHtml = row.cells
            .map((cell) => {
              const onDiagonal = cell.q === -cell.p;
              const bgClass = onDiagonal
                ? 'bg-neutral-100'
                : cell.isZero
                ? 'bg-green-50'
                : 'bg-white';
              const label = cell.isZero ? '= 0' : 'not forced to vanish';
              const labelClass = cell.isZero ? 'text-green-700' : 'text-neutral-500';
              return `
                <td class="px-2 py-2 border border-neutral-200 align-top ${bgClass}">
                  <button
                    type="button"
                    data-action="pick-kj"
                    data-k="${cell.k}"
                    data-j="${cell.j}"
                    class="w-full text-left rounded-md p-2 hover:bg-neutral-100 transition-colors"
                    title="Set k=${cell.k}, j=${cell.j}"
                  >
                    <div class="text-xs text-neutral-900">
                      ${mathSpan(`H^{${cell.p - cell.q}}(\\mathbf{Z}(${-cell.q}))`, 'inline')}
                    </div>
                    <div class="mt-1 text-[11px] font-semibold ${labelClass}">
                      ${label}
                    </div>
                  </button>
                </td>
              `;
            })
            .join('');
          return `
            <tr>
              <th class="px-3 py-2 text-xs font-semibold text-neutral-600 border border-neutral-200 bg-neutral-50">
                ${mathSpan(`q=${row.q}`, 'inline')}
              </th>
              ${cellsHtml}
            </tr>
          `;
        })
        .join('');

      const emptyHtml =
        magicResults.length === 0
          ? `<p class="text-sm text-neutral-700">No entries are forced to vanish for these values of ${mathSpan(
              'n,m',
              'inline'
            )}.</p>`
          : '';

      bodyHtml = `
        <div class="space-y-3">
          <p class="text-sm text-neutral-600">
            Grid entry ${mathSpan('(p,q)', 'inline')} is ${mathSpan(
        'H^{p-q}(\\mathbf{Z}(-q))',
        'inline'
      )} with ${mathSpan('p=0,\\dots,n', 'inline')} and ${mathSpan(
        'q=0,\\dots,-n',
        'inline'
      )} (top to bottom).
          </p>
          <div class="overflow-auto max-h-[70vh] border border-neutral-200 rounded-lg">
            <table class="min-w-full border-collapse">
              <thead class="bg-neutral-50 sticky top-0 z-10">
                <tr>
                  <th class="px-3 py-2 text-xs font-semibold text-neutral-600 border border-neutral-200 bg-neutral-100">
                    ${mathSpan('q \\backslash p', 'inline')}
                  </th>
                  ${thCells}
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
          <p class="text-xs text-neutral-500">
            Green cells are zero by the current ${mathSpan('n,m', 'inline')} assumptions.
          </p>
          ${emptyHtml}
        </div>
      `;
    } else {
      bodyHtml = `<p class="text-sm text-neutral-700">No (k, j) pairs found where all conditions are met.</p>`;
    }

    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Vanishing pairs">
        <div class="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-neutral-200 p-6">
          ${headerHtml}
          ${bodyHtml}
        </div>
      </div>
    `;
  }

  function templateConjectureDiagram(k, j, rows) {
    const thCells = Array.from({ length: Math.max(k, 0) + 1 }, (_, p_val) =>
      `<th class="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-r border-neutral-200 last:border-r-0">${mathSpan(
        `p=${p_val}`,
        'inline'
      )}</th>`
    ).join('');

    const rowsHtml = rows
      .map((row) => {
        const cellsHtml = row.cells
          .map((cell) => {
            const sBound = cell.b + j - k;
            const hasNegativeS = sBound < 0;
            const hasSmallC = cell.p < k - 2 * j;
            const grayReasons = [];
            if (!cell.isInRange) grayReasons.push('b > k');
            if (hasSmallC) grayReasons.push('c < k-2j');
            if (hasNegativeS) grayReasons.push('s < 0');
            const isGray = grayReasons.length > 0;

            const cellClass = isGray
              ? 'bg-neutral-100 text-neutral-400 opacity-75'
              : cell.isZero
              ? 'bg-green-50 text-green-900 ring-1 ring-inset ring-green-200 shadow-sm'
              : 'text-neutral-900 hover:bg-neutral-50';

            const mainMath = mathSpan(
              `\\operatorname{gr}^W_{${cell.q}} H^{${cell.b}}(X,\\mathbf{Q})${
                cell.isZero && !isGray ? ' = 0' : ''
              }`,
              'inline'
            );

            let notForcedHtml = '';
            if (!cell.isZero || isGray) {
              const pillClass = isGray
                ? 'bg-neutral-200 text-neutral-500'
                : 'bg-neutral-100 text-neutral-600';
              const pillText = isGray ? escapeHtml(grayReasons.join(', ')) : 'not forced';
              notForcedHtml = `
                <div class="text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${pillClass}">
                  ${pillText}
                </div>
              `;
            }

            let corollaryHtml = '';
            if (cell.corollaryPMax !== null) {
              corollaryHtml = `
                <div class="text-xs mt-2 text-blue-700 font-semibold flex items-center justify-center gap-1">
                  <span class="bg-blue-100 text-blue-700 rounded-full w-4 h-4 flex items-center justify-center">&#10003;</span>
                  ${mathSpan(`p \\le ${cell.corollaryPMax}`, 'inline')}
                </div>
              `;
            }

            let sBoundHtml = '';
            if (cell.isZero && !isGray) {
              sBoundHtml = `
                <div class="text-xs mt-1.5 text-green-700 font-medium">
                  ${mathSpan(`s\\le ${sBound}`, 'inline')}
                </div>
              `;
            }

            return `
              <td class="px-4 py-4 whitespace-nowrap text-sm text-center border-r border-neutral-200 last:border-r-0 align-middle transition-colors ${cellClass}">
                <div class="font-medium mb-1.5">
                  ${mainMath}
                </div>
                ${notForcedHtml}
                ${corollaryHtml}
                ${sBoundHtml}
              </td>
            `;
          })
          .join('');

        return `
          <tr>
            <th class="px-4 py-4 whitespace-nowrap text-sm text-neutral-700 bg-neutral-50 border-r border-neutral-200 align-middle">
              ${mathSpan(`q=${row.q}`, 'inline')}
            </th>
            ${cellsHtml}
          </tr>
        `;
      })
      .join('');

    return `
      <div class="overflow-x-auto border border-neutral-200 rounded-lg shadow-sm">
        <table class="min-w-full divide-y divide-neutral-200 border-collapse">
          <thead class="bg-neutral-50">
            <tr>
              <th class="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-r border-neutral-200">
                ${mathSpan('q \\backslash p', 'inline')}
              </th>
              ${thCells}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-200">${rowsHtml}</tbody>
        </table>
      </div>
    `;
  }

  function templateWeightsTable(corollaryResults) {
    if (corollaryResults.length === 0) {
      return `<p class="text-neutral-500 italic">No weight bounds from this corollary for the given parameters.</p>`;
    }

    const rowsHtml = corollaryResults
      .map(
        (res) => `
          <tr class="hover:bg-neutral-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">${res.i}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
              ${mathSpan(res.weightBound, 'inline')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
              ${mathSpan(`W_{${res.minWeight - 1}} H^{${res.i}}(X, \\mathbf{Q}) = 0`, 'inline')}
            </td>
          </tr>
        `
      )
      .join('');

    return `
      <div class="overflow-x-auto border border-neutral-200 rounded-lg">
        <table class="min-w-full divide-y divide-neutral-200">
          <thead class="bg-neutral-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-16">i</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Weights</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Weight Vanishing</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-200">${rowsHtml}</tbody>
        </table>
      </div>
    `;
  }

  function templateVanishingTable(corollaryResults) {
    if (corollaryResults.length === 0) {
      return `<p class="text-neutral-500 italic">No vanishing conditions from this corollary for the given parameters.</p>`;
    }

    const rowsHtml = corollaryResults
      .map((res) => {
        const vanishingHtml = res.vanishing
          .map(
            (v) =>
              `<div class="whitespace-nowrap">${mathSpan(v, 'inline')}</div>`
          )
          .join('');
        return `
          <tr class="hover:bg-neutral-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">${res.i}</td>
            <td class="px-6 py-4 text-sm text-neutral-900">${vanishingHtml}</td>
          </tr>
        `;
      })
      .join('');

    return `
      <div class="overflow-x-auto border border-neutral-200 rounded-lg">
        <table class="min-w-full divide-y divide-neutral-200">
          <thead class="bg-neutral-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-16">i</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Vanishing</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-200">${rowsHtml}</tbody>
        </table>
      </div>
    `;
  }

  function templateCoarseConditions(conditions) {
    if (conditions.length === 0) {
      return `<p class="text-neutral-500 italic">No coarse conditions required for these values.</p>`;
    }

    const itemsHtml = conditions
      .map((cond) => {
        const containerClass = cond.isMet
          ? 'bg-green-50 border-green-200'
          : 'bg-neutral-50 border-neutral-100';
        const pillHtml = cond.isMet
          ? `<span class="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">Met by Cor 1.5</span>`
          : '';
        return `
          <li class="flex items-center gap-4 p-3 rounded-lg border ${containerClass}">
            <span class="text-sm font-medium text-neutral-500 w-12">b = ${cond.b}</span>
            <div class="flex-1 overflow-x-auto">
              ${mathSpan(cond.text, 'inline')}
            </div>
            ${pillHtml}
          </li>
        `;
      })
      .join('');

    return `<ul class="space-y-3">${itemsHtml}</ul>`;
  }

  function templatePreciseConditions(conditions) {
    if (conditions.length === 0) {
      return `<p class="text-neutral-500 italic">No precise conditions required for these values.</p>`;
    }

    const rowsHtml = conditions
      .map((cond) => {
        const trClass = cond.isMet
          ? 'bg-green-50 hover:bg-green-100'
          : 'hover:bg-neutral-50';
        const pillHtml = cond.isMet
          ? `<span class="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">${escapeHtml(
              cond.metReason || ''
            )}</span>`
          : '';
        return `
          <tr class="transition-colors ${trClass}">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${cond.b}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${cond.c}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${cond.w}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${cond.r}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${cond.s}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
              <div class="flex items-center gap-3">
                ${mathSpan(cond.text, 'inline')}
                ${pillHtml}
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <div class="overflow-x-auto border border-neutral-200 rounded-lg">
        <table class="min-w-full divide-y divide-neutral-200">
          <thead class="bg-neutral-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">b</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">c</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">w (b-c)</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">r</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">s</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Condition</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-200">${rowsHtml}</tbody>
        </table>
      </div>
    `;
  }

  // ---------- render loop ----------

  function writeAndRenderMath(containerId, html) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = html;
    renderMath(el);
  }

  function render() {
    const { n, m, k, j, magicResults } = state;

    const corollaryResults = computeCorollaryResults(n, m);
    const coarseConditions = computeCoarseConditions(k, j, corollaryResults);
    const preciseConditions = computePreciseConditions(k, j, n, m);
    const conjectureRows = computeConjectureDiagramRows(k, j, n, m);

    const magicResultSet = magicResults
      ? new Set(magicResults.map((r) => `${r.k}:${r.j}`))
      : new Set();
    const magicRows = computeMagicGridRows(n, magicResultSet);

    // Keep the k/j inputs in sync when the magic grid updates them.
    const kInput = document.getElementById('k-input');
    const jInput = document.getElementById('j-input');
    if (kInput && kInput.value !== String(k)) kInput.value = String(k);
    if (jInput && jInput.value !== String(j)) jInput.value = String(j);

    writeAndRenderMath('nm-warning', templateNmWarning(n, m));
    writeAndRenderMath('magic-dialog', templateMagicDialog(n, magicResults, magicRows));
    writeAndRenderMath('conjecture-diagram', templateConjectureDiagram(k, j, conjectureRows));
    writeAndRenderMath('weights-table', templateWeightsTable(corollaryResults));
    writeAndRenderMath('vanishing-table', templateVanishingTable(corollaryResults));
    writeAndRenderMath('coarse-conditions', templateCoarseConditions(coarseConditions));
    writeAndRenderMath('precise-conditions', templatePreciseConditions(preciseConditions));
  }

  // ---------- event wiring ----------

  function onReady() {
    // Render static math (headers/prose).
    renderMath(document.body);

    const nInput = document.getElementById('n-input');
    const mInput = document.getElementById('m-input');
    const kInput = document.getElementById('k-input');
    const jInput = document.getElementById('j-input');

    nInput.addEventListener('input', (e) => setN(parseInt(e.target.value, 10)));
    mInput.addEventListener('input', (e) => setM(parseInt(e.target.value, 10)));
    kInput.addEventListener('input', (e) => setK(parseInt(e.target.value, 10)));
    jInput.addEventListener('input', (e) => setJ(parseInt(e.target.value, 10)));

    document.getElementById('magic-button').addEventListener('click', () => {
      state.magicResults = computeMagicResults(state.n, state.m);
      state.isMagicDialogOpen = true;
      render();
    });

    // Event delegation for dynamically generated buttons.
    const dialogContainer = document.getElementById('magic-dialog');
    dialogContainer.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      if (action === 'close-magic-dialog') {
        state.isMagicDialogOpen = false;
        render();
      } else if (action === 'pick-kj') {
        const k = parseInt(target.getAttribute('data-k'), 10);
        const j = parseInt(target.getAttribute('data-j'), 10);
        setKJ(k, j);
        state.isMagicDialogOpen = false;
        render();
      }
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
