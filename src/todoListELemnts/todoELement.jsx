
import styles from "../css/todoElements.module.css"
import StarIcon from '@mui/icons-material/Star';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';

// TodoTaskViewer() => {string,arr_Of_object,setHook,string,string,string}
function TodoTaskViewer({task,allTask,setAllTask,week,prio_level,time}){

    const taskDeletion =()=>{
        let Arr_of_task = allTask.map(data=>data.task);
        if(Arr_of_task.includes(task)){
            console.log('deleting now...task : ',task)
            console.log("arroftask before : ",allTask)
            let newTask_Arr_of_obj = [...allTask.slice(0,Arr_of_task.indexOf(task)),...allTask.slice(Arr_of_task.indexOf(task)+1)];
            console.log("array of task after : ",newTask_Arr_of_obj);
            setAllTask(newTask_Arr_of_obj)
        }
    } 

    let colors =["#1AFFD5","#D4DCFF","#6CD4FF","#50D8D7"]
    let Num = Math.floor((Math.random() * colors.length))
    return(
        <> 
            <div className={styles.Task_Box} style={{backgroundColor:colors[Num]}}>
                <div className={styles.Box_Header}>
                    <div style={{display:"flex",alignItems: "center"}}>
                    <StarIcon
                    sx={
                        {
                            color:"orange"
                        }}
                    />
                    <p>{week?week:"error"}</p>
                    </div>
                    <span>priorty : <button>{prio_level}</button></span>
                </div>
                <div className={styles.Box_Main}>
                    <h1>{task}</h1>
                </div>
                <div className={styles.Box_Footer}>
                        <button onClick={taskDeletion}>delete</button>
                        <p style={
                            {
                                display:"flex",
                                gap:".1rem"
                            }
                        }>{time?time:"00:00"}<QueryBuilderIcon/></p>
                </div>
            </div>
        </>
    )
}


export {TodoTaskViewer}