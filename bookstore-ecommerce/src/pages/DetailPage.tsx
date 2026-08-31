import { useNavigate } from "react-router-dom"

export default function DetailPage() {
    const navigate = useNavigate()
    const prueba = () => {
    navigate("/")
  }

  return (
    <>
      <h1>Página 2</h1>
      <button 
        onClick={prueba}>
          Volver
      </button>
    </>
  )
}