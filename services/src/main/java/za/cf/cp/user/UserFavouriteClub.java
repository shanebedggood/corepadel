package za.cf.cp.user;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "user_favourite_club", schema = "core")
public class UserFavouriteClub extends PanacheEntityBase implements Serializable {

    @Id
    @Column(name = "firebase_uid")
    public String firebaseUid;

    @Id
    @Column(name = "club_id")
    public java.util.UUID clubId;
}


