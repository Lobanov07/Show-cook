import '../css/Creators.css'
import Mark from '../img/Mark.jpg'
import Kostya from '../img/Kostya.jpg'
import Tema from '../img/Tema.jpg'
import Main_menu from './Sidebar';

export default function Team (){
    const teamMembers = [
        {
          name: "Марк Соколов",
          description: "CV-Engineer",
          image: Mark, 
        },
        {
          name: "Константин Лобанов",
          description: "Dev-Ops, Backend",
          image: Kostya
        },
        {
          name: "Артём Ледовских",
          description: "Frontend",
          image: Tema
        },
      ];
      
      return (
        <>
        <div className='show_cook'>
        <div className='flexible_show'>
            <Main_menu />
        </div>
        <div className="team-section">
          <h2 className="team-title">О КОМАНДЕ</h2>
          <div className="team-members">
            {teamMembers.map((member, index) => (
              <div className="team-member" key={index}>
                <div className="avatar">
                  <img src={member.image} alt={member.name} />
                </div>
                <p className="name">{member.name}</p>
                <p className="description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
        </>
      );
}