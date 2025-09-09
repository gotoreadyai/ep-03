import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

const RodoDisclaimer = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(false);

  useEffect(() => {
    // Sprawdź w localStorage czy użytkownik już zaakceptował
    const accepted = localStorage.getItem('disclaimerAccepted');
    
    if (accepted === 'true') {
      setHasSeenDisclaimer(true);
    } else {
      // Jeśli nie zaakceptował, pokaż popup po 100ms
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setShowPopup(false);
    setHasSeenDisclaimer(true);
    // Zapisz w localStorage, że użytkownik zaakceptował
    localStorage.setItem('disclaimerAccepted', 'true');
  };

  const handleReject = () => {
    // WAŻNE: Usuń z localStorage informację o akceptacji
    // aby przy następnej wizycie znowu pokazał się komunikat RODO
    localStorage.removeItem('disclaimerAccepted');
    // Przekieruj do Google
    window.location.href = 'https://www.google.com';
  };

  return (
    <>
      {/* DYSKRETNY PASEK INFORMACYJNY */}
      <div 
        className="fixed z-40 bottom-0 left-0 right-0 bg-purple-600 text-purple-50 px-4 py-2 cursor-pointer hover:bg-purple-700 transition-colors duration-300" 
        onClick={() => setShowPopup(true)}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <Info className="w-4 h-4" />
          <span className="text-sm font-light tracking-wide">
            DANCEHUB (SYSTEM DEMONSTRACYJNY). Informacja o przetwarzaniu danych osobowych
          </span>
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-purple-900 bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-pink-50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-pink-100">
            <div className="p-6">
              {/* Nagłówek */}
              <div className="mb-6">
                <h2 className="text-2xl font-light text-purple-800 tracking-tight">
                  <Info className="inline-block mr-2 mb-1 text-purple-600" size={24} />
                  Informacja o danych osobowych
                </h2>
              </div>

              <div className="space-y-4">
                {/* Informacja o charakterze demonstracyjnym */}
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">System demonstracyjno-biznesowy</h3>
                  <p className="text-purple-700 mb-2 text-sm">
                    Zalecamy używanie danych fikcyjnych:
                  </p>
                  <ul className="list-disc list-inside text-purple-600 space-y-1 ml-4 text-sm">
                    <li>Email: np. demo@example.com</li>
                    <li>Imię/Pseudonim: wymyślone</li>
                    <li>Miasto: fikcyjne</li>
                    <li>Wiek i wzrost: dowolne liczby</li>
                  </ul>
                </div>

                {/* Główna informacja */}
                <div className="bg-pink-100 border border-pink-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">Jakie dane zbieramy?</h3>
                  <p className="text-purple-700 mb-2 text-sm">
                    W ramach tego systemu przechowujemy następujące informacje:
                  </p>
                  <ul className="list-disc list-inside text-purple-600 space-y-1 ml-4 text-sm">
                    <li>Adres email</li>
                    <li>Miasto zamieszkania</li>
                    <li>Imię i nazwisko lub pseudonim</li>
                    <li>Wiek</li>
                    <li>Wzrost</li>
                  </ul>
                </div>

                {/* Informacje o bezpieczeństwie */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">Bezpieczeństwo danych</h3>
                  <p className="text-purple-700 text-sm">
                    System został zabezpieczony zgodnie z najlepszymi praktykami. 
                    Twoje dane są przechowywane w bezpieczny sposób i wykorzystywane 
                    wyłącznie do celów funkcjonowania aplikacji.
                  </p>
                </div>

                {/* Cel przetwarzania */}
                <div className="bg-pink-50 border border-pink-100 rounded-lg p-4">
                  <h3 className="font-medium text-purple-800 mb-2">Cel przetwarzania</h3>
                  <p className="text-purple-600 text-sm">
                    Dane są wykorzystywane do personalizacji doświadczeń użytkownika, 
                    umożliwienia komunikacji oraz zapewnienia prawidłowego funkcjonowania 
                    systemu. Nie udostępniamy danych osobom trzecim bez Twojej zgody.
                  </p>
                </div>

                {/* Prawa użytkownika */}
                <div className="bg-pink-50 border border-pink-100 rounded-lg p-4">
                  <h3 className="font-medium text-purple-800 mb-2">Twoje prawa</h3>
                  <p className="text-purple-600 text-sm">
                    Masz prawo do dostępu, modyfikacji oraz usunięcia swoich danych osobowych. 
                    W przypadku pytań dotyczących przetwarzania danych, skontaktuj się z administratorem systemu.
                  </p>
                </div>

                {/* Wyłączenie odpowiedzialności */}
                <div className="bg-rose-100 border border-rose-200 rounded-lg p-4">
                  <h3 className="font-medium text-rose-900 mb-2">Wyłączenie odpowiedzialności</h3>
                  <p className="text-rose-700 text-sm">
                    Jako system demonstracyjno-biznesowy, <strong className="text-rose-800">nie ponosimy odpowiedzialności</strong> za 
                    jakiekolwiek skutki wynikające z używania prawdziwych danych osobowych. 
                    Użytkownik korzysta z systemu na własną odpowiedzialność.
                  </p>
                </div>

                {/* Informacja o pierwszym uruchomieniu */}
                {!hasSeenDisclaimer && (
                  <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-700">
                      <strong className="text-purple-800">Uwaga:</strong> Ten komunikat pojawia się przy pierwszym 
                      uruchomieniu aplikacji. Możesz go ponownie otworzyć klikając 
                      na pasek informacyjny u dołu strony.
                    </p>
                  </div>
                )}

                {/* Przyciski */}
                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={handleAccept}
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Rozumiem i akceptuję
                  </button>
                  <button 
                    onClick={handleReject}
                    className="flex-1 bg-pink-200 text-purple-800 px-6 py-3 rounded-lg font-medium hover:bg-pink-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Nie akceptuję
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RodoDisclaimer;