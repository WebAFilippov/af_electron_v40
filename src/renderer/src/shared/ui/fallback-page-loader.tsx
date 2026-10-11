import { Spinner } from './spinner'

export const FallbackPageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <Spinner className="w-8 h-8" />
  </div>
)
