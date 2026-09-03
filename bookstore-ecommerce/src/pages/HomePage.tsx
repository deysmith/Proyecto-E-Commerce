import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const navigate = useNavigate()
  const prueba = () => {
    navigate("/detail")
  }

  return (
    <>
      <h1>Página 1</h1>
      <button 
        onClick={prueba}>
          Volver
      </button>
    </>
  )
}