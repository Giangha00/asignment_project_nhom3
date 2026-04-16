# Card Description Rich Text (CKEditor)

## Muc dich
Phan mo ta the (`description`) duoc luu duoi dang HTML string de ho tro rich text (bold, italic, heading, list, link, image).

## Dinh dang du lieu
- Kieu du lieu: `String` trong model card.
- Gia tri luu trong DB: HTML da duoc tao tu CKEditor, vi du:

```html
<h2>Ke hoach sprint</h2>
<p><strong>Can hoan thanh</strong> trong tuan nay.</p>
<ul>
  <li>Cap nhat API</li>
  <li>Bo sung test</li>
</ul>
<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">Tai lieu</a></p>
```

## Tuong thich du lieu cu
- Du lieu plain text cu van hien thi binh thuong.
- He thong tu dong normalize plain text sang HTML paragraph khi can mo editor.

## Bao mat sanitize
- Khong render truc tiep HTML thuan tu API.
- Luon sanitize truoc khi hien thi o view mode.
- Cac the duoc phep gom: `p`, `h1-h3`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `img`, `figure`, `figcaption`, `blockquote`, `br`.
- URL trong `href`/`src` duoc validate protocol (`http`, `https`, `mailto`, `tel`; image cho phep `data:image/*`).
- Link ngoai duoc gan `target="_blank"` + `rel="noopener noreferrer nofollow"`.

## Luu y khi mo rong
- Neu them plugin moi cho CKEditor (vd: table, code block), can cap nhat bo sanitize tuong ung trong `src/lib/richTextDescription.js`.
- Moi thay doi toolbar can duoc test lai 4 luong: tao/sua/luu, chen link, chen anh, reload modal/trang.
