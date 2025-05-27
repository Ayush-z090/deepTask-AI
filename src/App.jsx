import styles from './css/App.module.css'
import "./index.css"
import { TodoTaskViewer } from './todoListELemnts/todoELement'
import {  useRef, useState } from 'react'
import { SVG_LOader } from './SVG_Element/svgs'
import { ai_Call } from './Js_Scripts/fetch'
import BgImage from "./assets/imageBg.jpg"
import { useSwipeable } from 'react-swipeable';


function App() {

  let val = JSON.parse(localStorage.getItem("tasksArr")) ?  JSON.parse(localStorage.getItem("tasksArr")) : [];
  // will track the condition when the communication btw ui and backend is happening,true when data isnt recevied 
  // fasle when it gets a result
  // will track the show task related query when we show tasks in the ui it becomes true else false
  let [isOn_taskDisplay,set_taskDisplay] = useState(true);

  let [TaskConditon,setCondtion] = useState(true)

 
  let swipElement_One =useRef(null);
  let swipElement_Two =useRef(null);
   let [currentElement,setSwipeElement]=useState(0)

  let [Tasks ,setTask]= useState(val);
  let [ChildElement,setChildElemnt] = useState(
            Tasks.length !==0 ? Tasks.map(user_task=>
            <TodoTaskViewer 
            task={user_task.task} 
            allTask={Tasks} setAllTask={setTask} 
            week={user_task.week} 
            time={user_task.time}
            prio_level = {user_task.prio_Level}/>):(<p>no added task so far</p>)
          );
  let [showTaskMessage,setTaskMessage] =  useState("type anything ....");
  let [aiFieldDisplay,setAiDisplayCondition] = useState(false)
  
   const handlers = useSwipeable({
    onSwipedLeft: () => {
      console.log("left")
     if(currentElement === 0){
      swipElement_One.current.style.transform="translateX(-34rem)";
      swipElement_Two.current.style.transform="translateX(0rem)";
      swipElement_One.current.style.visibility="hidden";
      swipElement_Two.current.style.visibility ="initial"
      swipElement_One.current.style.opacity = 0;
      swipElement_Two.current.style.opacity = 1;
      setSwipeElement(1)
     }
    },
    onSwipedRight: () => {
      if(currentElement === 1){
      swipElement_One.current.style.transform="translateX(0)"
      swipElement_Two.current.style.transform="translateX(34rem)"
      swipElement_One.current.style.opacity = 1;
      swipElement_Two.current.style.opacity = 0;
      swipElement_Two.current.style.visibility = "hidden";
      swipElement_One.current.style.visibility = "initial"

      setSwipeElement(0)
     }
    },
    // onSwipedUp: () => console.log('Swiped Up'),
    // onSwipedDown: () => console.log('Swiped Down'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });
  // this condition will handle the elemnts when the user deleted the task
  // as handling taskbox render is done inside the form so we have to ask ai again to show elemmnt then only it will update or
  // we have to refresh the page then ask ai to show task .. this is wrong way to solve this 
  // this condition will check the task array in hook variable and localstorage
  // the deletion is done in hook var not in localstorage so if a user delet a task,one elemnt in hook var array is remove
  // total task in both hookvar ,localstorage have to be same, as we are updating hookVar and localstorage together everywhere we use them...
  if (Tasks.map(data=>data.task).length !== JSON.parse(localStorage.getItem("tasksArr")).map(data=>data.task).length){
    localStorage.setItem("tasksArr",JSON.stringify(Tasks))
    if(Tasks.length !== 0)(
      setChildElemnt(
            Tasks.map(user_task=>
            <TodoTaskViewer 
            task={user_task.task} 
            allTask={Tasks} setAllTask={setTask} 
            week={user_task.week} 
            time={user_task.time}
            prio_level = {user_task.prio_Level}/>)
          ))
    else {
      setTaskMessage("theres no task here")
      setChildElemnt([<h1>no task here</h1>])}
  }

  let formSubmit = (e)=>{
    e.preventDefault();
    set_taskDisplay(false);
    setChildElemnt([SVG_LOader]);
    setTaskMessage("analyzing ur response .... wait for few seconds");
    

    let formdata = new FormData(e.target);
    
    ai_Call(formdata.get('input'))
    .then(data=> data.json())
    .then(data=> 
      {  

        console.log(data)
        // set the config  when user ask to add a task

        if (Object.keys(data.message).includes("addUser") && data.message.addUser === true ){
          setTaskMessage("added data");
          setChildElemnt([<h1>task has added succefully</h1>]);
          let weekName =["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
          let dateObj = String(new Date())
          let timeStr = /\d{2}:\d{2}/.exec(String(dateObj))[0]
          setTask(
            [{
              task:data.message.UserTask,
              prio_Level :data.message.prio_levl,
              week:weekName[new Date().getDay()],
              time:timeStr
            },...Tasks]);
          localStorage.setItem(
            "tasksArr",JSON.stringify([
              {
                task:data.message.UserTask,
                prio_Level :data.message.prio_levl,
                week:weekName[new Date().getDay()],
                time:timeStr
              },...Tasks])
          );
          e.target.reset();
        }
        // set the config when user wants to see the task
        else if(Object.keys(data.message).includes("showList") && data.message.showList === true){
          set_taskDisplay(true);
          setTaskMessage(data.message.message);
          if (Tasks.length === 0) setChildElemnt(<h1>theres no tasks here</h1>);
          else
          setChildElemnt(
            Tasks.map(user_task=>
            <TodoTaskViewer 
            task={user_task.task} 
            allTask={Tasks} setAllTask={setTask} 
            week={user_task.week} 
            time={user_task.time}
            prio_level = {user_task.prio_Level}/>)
          );
          e.target.reset();
        }
        // take a array of string where string representing related task to achive something or a routine task etc..
        else if (Object.keys(data.message).includes("userGoalTask")){
          setCondtion(true);
          set_taskDisplay(true)
          setTaskMessage(data.message.taskDetails)
          setChildElemnt(
            data.message.arrGoalTask
            .map(user_task => <TodoTaskViewer task={user_task.task}  prio_level = {user_task.task_prio}/>)
          );
          e.target.reset();
        }
        // handle ui elemnts on based on ui 
        else if(Object.keys(data.message).includes("userPrio")){
          set_taskDisplay(true);
          setTaskMessage(data.message.userMessage);
          if (data.message.updatedData.length ===0) setChildElemnt(<h1>theres no tasks here</h1>);
          else
          setChildElemnt(
            data.message.updatedData
            .map(up_task => <TodoTaskViewer 
                            task={up_task.task} 
                            allTask={Tasks} 
                            setAllTask={setTask} 
                            prio_level={up_task.prio_Level}/>)
                          );
          e.target.reset();
        }

        else if(Object.keys(data.message).includes("userDel")){
          set_taskDisplay(true)
          setTaskMessage(data.message.ai_res)
          localStorage.setItem("tasksArr",JSON.stringify(data.message.updatedData))
          setTask(data.message.updatedData)
          if(data.message.updatedData.length === 0) setChildElemnt(<h1>theres no tasks here</h1>);
          else setChildElemnt(
            data.message.updatedData
            .map(up_task=><TodoTaskViewer 
                            task={up_task.task} 
                            allTask={Tasks} 
                            setAllTask={setTask} 
                            prio_level={up_task.prio_Level}/>
                          )
                        );
          e.target.reset();

        }
        // handles response when it cant do action the use wants
        else if (Object.keys(data.message).includes("default")){
          setTaskMessage(data.message.ai_res)
          e.target.reset()
          setChildElemnt((<h1>nothing here</h1>))
        }



    })
    .catch(rej=> {
      set_taskDisplay(false)
      setTaskMessage('unable to talk with ai right now try again after sometimes,if this happens even after sometimes refresh the page')
      setChildElemnt([<h1>nothing to show here</h1>])
    })
    
  }

  let sty = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"  // Fixed typo here
  };

  
  let taskDisplayStyleBox = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.9rem",  // Added quotes around the value
    padding:"1rem 1.5rem"
  }
  
  let iconImg = (<img width="32" height="32" src="https://img.icons8.com/windows/32/monzo.png" alt="monzo"/>)

  return (
    <>
    <div className={styles.AppBody}>
      <div className={styles.MainBody}>
        <header className={styles.header} onClick={()=> setAiDisplayCondition(!aiFieldDisplay)}>
          <div className={styles.part1}>
            {iconImg}<p>DeepTask</p>
          </div>
        </header>
        <main>
          <div className={styles.LeftHalfBody} {...handlers} 
          style={aiFieldDisplay?{
                  width:"100%",
                  filter:"initial",
                  flexDirection:"column-reverse",
                  backdropFilter:"opacity(.4)",
                  color:"var(--color-type1-)````````````````"
                }  
                  :{}}>

              <p ref={swipElement_One}>
                <span>Type what you need. No menus,</span>
                <span>no clutter,</span>
                <span>just smart </span>
                <span>task management</span>
                <span>in seconds!</span></p>
                
              <div className={styles.aiInputFieldBox} style={aiFieldDisplay?{width:"98%"}:{}} ref={swipElement_Two}>
                {aiFieldDisplay?"":(<p> This taskmanager helps you manage tasks effortlessly by suggesting topics like 'priority sorting,' 'deadline tracking,' and 'smart reminders.' It simplifies app handling with intelligent automation."</p>)}
                     <div className={styles.Top_main_box}>
                          {aiFieldDisplay ?(<div className={styles.responseField}>
                          <p>{showTaskMessage}</p>
                          </div>):""}
                          <form onSubmit={formSubmit} className={styles.input_field_assistance}>
                              <textarea name="input" onClick={()=>setAiDisplayCondition(true)} id="textArea" placeholder='type here'></textarea>
                                <div className={styles.submiterElemnt}>
                                  <p>ask anythig here realated to the project</p>
                                  <button>submit</button>
                              </div>
                          </form>
                      </div>
                        {aiFieldDisplay ? (<div className={styles.DisplayedElementsBox} style={isOn_taskDisplay ? {...taskDisplayStyleBox} :{...sty}}>
                                                  {ChildElement}
                                          </div>):""}
              </div>
          </div>
          <div className={styles.RightHalfBody} style={aiFieldDisplay? {width:0,opacity:0}:{}}>
            <img src={BgImage} alt="nothing here" />
          </div>
        </main>
      
      </div>
    </div>
    </>
  )
}



export default App


