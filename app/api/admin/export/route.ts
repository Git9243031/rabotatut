import { NextRequest, NextResponse } from 'next/server'
import { adminDb }  from '@/lib/firebaseAdmin'
import * as XLSX    from 'xlsx'
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
} from 'docx'

const SPHERE_RU: Record<string,string> = {
  it:'IT', design:'Дизайн', marketing:'Маркетинг', finance:'Финансы',
  hr:'HR', sales:'Продажи', legal:'Юриспруденция', other:'Другое',
}
const FORMAT_RU: Record<string,string> = {
  remote:'Удалённо', office:'Офис', hybrid:'Гибрид',
}
const LEVEL_RU: Record<string,string> = {
  junior:'Junior', middle:'Middle', senior:'Senior', lead:'Lead', any:'Любой',
}

function fmtSalary(min?: number, max?: number) {
  if (!min && !max) return '—'
  if (min && max) return `${min.toLocaleString('ru')} – ${max.toLocaleString('ru')} ₽`
  if (min) return `от ${min.toLocaleString('ru')} ₽`
  return `до ${max!.toLocaleString('ru')} ₽`
}

function fmtDate(val: any): string {
  if (!val) return '—'
  // Firestore Timestamp → Date
  const d = val?.toDate ? val.toDate() : new Date(val)
  return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' })
}

function makeRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 28, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: 'F8FAFC' },
        children: [new Paragraph({
          children: [new TextRun({ text: label, bold: true, size: 18, color: '64748B' })],
        })],
      }),
      new TableCell({
        width: { size: 72, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          children: [new TextRun({ text: value || '—', size: 18 })],
        })],
      }),
    ],
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type   = searchParams.get('type')   // 'jobs' | 'resumes'
  const format = searchParams.get('format') // 'xlsx' | 'docx'

  if (!type || !format) {
    return NextResponse.json({ error: 'type and format required' }, { status: 400 })
  }

  try {
    // ── Читаем данные через Firebase Admin SDK ────────────────────
    // Аналог: createAdminClient() → supabase.from(type).select('*').order('created_at')
    const snap  = await adminDb.collection(type).orderBy('created_at', 'desc').get()
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))

    // ── XLSX ──────────────────────────────────────────────────────
    if (format === 'xlsx') {
      let rows: any[]

      if (type === 'jobs') {
        rows = items.map((j: any) => ({
          'Название':    j.title        ?? '—',
          'Компания':    j.company      ?? '—',
          'Сфера':       SPHERE_RU[j.sphere] ?? j.sphere ?? '—',
          'Уровень':     LEVEL_RU[j.experience_level] ?? j.experience_level ?? '—',
          'Формат':      FORMAT_RU[j.format] ?? j.format ?? '—',
          'Тип':         j.job_type     ?? '—',
          'Город':       j.location     ?? '—',
          'Зарплата':    fmtSalary(j.salary_min, j.salary_max),
          'Навыки':      (j.skills ?? []).join(', '),
          'Просмотры':   j.views        ?? 0,
          'Активна':     j.visible ? 'Да' : 'Нет',
          'Дата':        fmtDate(j.created_at),
        }))
      } else {
        rows = items.map((r: any) => ({
          'Имя':           r.name              ?? '—',
          'Должность':     r.title             ?? '—',
          'Сфера':         SPHERE_RU[r.sphere] ?? r.sphere ?? '—',
          'Формат':        FORMAT_RU[r.format] ?? r.format ?? '—',
          'Опыт (лет)':   r.experience_years  ?? 0,
          'Город':         r.location          ?? '—',
          'Зарплата':      r.expected_salary
            ? `от ${r.expected_salary.toLocaleString('ru')} ₽` : '—',
          'Навыки':        (r.skills ?? []).join(', '),
          'Портфолио':     r.portfolio         ?? '—',
          'Активно':       r.visible ? 'Да' : 'Нет',
          'Дата':          fmtDate(r.created_at),
        }))
      }

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, type === 'jobs' ? 'Вакансии' : 'Резюме')
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${type}-export.xlsx"`,
        },
      })
    }

    // ── DOCX ──────────────────────────────────────────────────────
    if (format === 'docx') {
      const sections: any[] = []

      for (const item of items as any[]) {
        const rows = type === 'jobs'
          ? [
              makeRow('Название',    item.title        ?? '—'),
              makeRow('Компания',    item.company      ?? '—'),
              makeRow('Сфера',       SPHERE_RU[item.sphere] ?? item.sphere ?? '—'),
              makeRow('Уровень',     LEVEL_RU[item.experience_level] ?? item.experience_level ?? '—'),
              makeRow('Формат',      FORMAT_RU[item.format] ?? item.format ?? '—'),
              makeRow('Тип',         item.job_type     ?? '—'),
              makeRow('Город',       item.location     ?? '—'),
              makeRow('Зарплата',    fmtSalary(item.salary_min, item.salary_max)),
              makeRow('Навыки',      (item.skills ?? []).join(', ')),
              makeRow('Просмотры',   String(item.views ?? 0)),
              makeRow('Активна',     item.visible ? 'Да' : 'Нет'),
              makeRow('Дата',        fmtDate(item.created_at)),
              makeRow('Описание',    item.description  ?? '—'),
            ]
          : [
              makeRow('Имя',         item.name         ?? '—'),
              makeRow('Должность',   item.title        ?? '—'),
              makeRow('Сфера',       SPHERE_RU[item.sphere] ?? item.sphere ?? '—'),
              makeRow('Формат',      FORMAT_RU[item.format] ?? item.format ?? '—'),
              makeRow('Опыт',        `${item.experience_years ?? 0} лет`),
              makeRow('Город',       item.location     ?? '—'),
              makeRow('Зарплата',    item.expected_salary
                ? `от ${item.expected_salary.toLocaleString('ru')} ₽` : '—'),
              makeRow('Навыки',      (item.skills ?? []).join(', ')),
              makeRow('Портфолио',   item.portfolio    ?? '—'),
              makeRow('Активно',     item.visible ? 'Да' : 'Нет'),
              makeRow('Дата',        fmtDate(item.created_at)),
              makeRow('О себе',      item.bio          ?? '—'),
            ]

        sections.push(
          new Paragraph({
            text:    type === 'jobs' ? (item.title ?? '') : (item.name ?? ''),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 120 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top:           { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              bottom:        { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              left:          { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              right:         { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              insideH:       { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              insideV:       { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            },
            rows,
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
        )
      }

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text:      type === 'jobs' ? 'Вакансии' : 'Резюме',
              heading:   HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing:   { after: 400 },
            }),
            ...sections,
          ],
        }],
      })

      const buf = await Packer.toBuffer(doc)

      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${type}-export.docx"`,
        },
      })
    }

    return NextResponse.json({ error: 'Unknown format' }, { status: 400 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
