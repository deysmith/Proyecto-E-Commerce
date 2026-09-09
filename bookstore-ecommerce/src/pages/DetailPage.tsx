import { useNavigate } from "react-router-dom"

export default function DetailPage() {
    const navigate = useNavigate()
    const prueba = () => {
    navigate("/")
  }

  return (
    <>
      <h1>Proximamente</h1>
      <button 
        onClick={prueba}>
          Volver
      </button>
    </>
  )
}