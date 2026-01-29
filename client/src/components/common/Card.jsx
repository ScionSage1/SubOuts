import clsx from 'clsx'

export default function Card({ children, className, onClick, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className }) {
  return (
    <div className={clsx('px-4 py-3 border-b border-gray-200', className)}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className }) {
  return (
    <div className={clsx('p-4', className)}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className }) {
  return (
    <div className={clsx('px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg', className)}>
      {children}
    </div>
  )
}
