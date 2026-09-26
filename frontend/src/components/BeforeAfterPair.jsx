/**
 * Full composite before|after photo with flat badges + captions.
 * Image is shown whole (no crop) — halves stay centered in frame.
 */
export default function BeforeAfterPair({
  src,
  alt,
  beforeCaption = 'Before: Everyday coat',
  afterCaption = 'After: Healthy & styled finish',
}) {
  return (
    <figure className="lp-ba" aria-label={alt}>
      <div className="lp-ba-frame">
        <img src={src} alt={alt} className="lp-ba-img" draggable={false} />
        <span className="lp-ba-badge lp-ba-badge--before">Before</span>
        <span className="lp-ba-badge lp-ba-badge--after">After</span>
      </div>
      <div className="lp-ba-caps">
        <figcaption className="lp-ba-cap lp-ba-cap--before">{beforeCaption}</figcaption>
        <figcaption className="lp-ba-cap lp-ba-cap--after">{afterCaption}</figcaption>
      </div>
    </figure>
  )
}
