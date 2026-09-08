const accentGradients = {
  red: 'from-red-main to-orange-accent',
  blue: 'from-blue-accent to-green-accent',
  orange: 'from-orange-accent to-red-main',
  green: 'from-green-accent to-blue-accent',
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function SectionTitle({
  title,
  subtitle,
  accentWord,
  align = 'left',
  color = 'red',
  singleLine = false,
}) {
  const titleParts = accentWord
    ? title.split(new RegExp(`(${escapeRegExp(accentWord)})`, 'i'))
    : [title]

  const accentClasses = accentGradients[color] ?? accentGradients.red
  const wrapperAlignmentClass = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  const barAlignmentClass = align === 'center' ? 'mx-auto' : 'mx-0'

  return (
    <div className={`flex flex-col ${wrapperAlignmentClass}`}>
      <h2
        className={`max-w-4xl font-black leading-tight text-black-text sm:text-4xl lg:text-4xl ${
          singleLine
            ? 'whitespace-nowrap text-[clamp(1.45rem,4.6vw,2.5rem)]'
            : 'text-3xl'
        }`}
      >
        {titleParts.map((part, index) => {
          const isAccentPart = Boolean(accentWord) && part.toLowerCase() === accentWord.toLowerCase()

          if (isAccentPart) {
            return (
              <span
                key={`${part}-${index}`}
                className={`bg-gradient-to-r ${accentClasses} bg-clip-text text-transparent`}
              >
                {part}
              </span>
            )
          }

          return <span key={`${part}-${index}`}>{part}</span>
        })}
      </h2>

      <div
        className={`mt-3 h-[5px] w-[72px] rounded-full bg-gradient-to-r ${accentClasses} ${barAlignmentClass}`}
        aria-hidden="true"
      />

      {subtitle ? <p className="mt-2 text-base font-semibold leading-relaxed text-gray-text">{subtitle}</p> : null}
    </div>
  )
}

export default SectionTitle